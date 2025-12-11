'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getFirestore, doc, updateDoc, runTransaction, increment } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import crypto from 'crypto';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);

const isProduction = process.env.NODE_ENV === 'production';

const SSLCOMMERZ_VALIDATION_API = isProduction
  ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

const STORE_ID = isProduction
  ? process.env.SSLCOMMERZ_STORE_ID_LIVE
  : process.env.SSLCOMMERZ_STORE_ID_SANDBOX;

const STORE_PASSWORD = isProduction
  ? process.env.SSLCOMMERZ_STORE_PASSWORD_LIVE
  : process.env.SSLCOMMERZ_STORE_PASSWORD_SANDBOX;


async function validatePayment(val_id: string) {
    if (!STORE_ID || !STORE_PASSWORD) {
        throw new Error('SSLCommerz credentials are not configured.');
    }
    
    const validationUrl = new URL(SSLCOMMERZ_VALIDATION_API);
    validationUrl.searchParams.append('val_id', val_id);
    validationUrl.searchParams.append('store_id', STORE_ID);
    validationUrl.searchParams.append('store_passwd', crypto.createHash('md5').update(STORE_PASSWORD).digest('hex'));
    validationUrl.searchParams.append('format', 'json');

    const response = await fetch(validationUrl.toString());
    const data = await response.json();
    return data;
}

const getDonorLevel = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
};


export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const status = body.get('status') as string;
    // The tran_id from SSLCommerz, not our internal one.
    // const tran_id = body.get('tran_id') as string;
    const val_id = body.get('val_id') as string;
    // Our internal donation ID passed via value_a
    const donationId = body.get('value_a') as string;

    if (!donationId) {
       console.error("SSLCommerz callback missing 'value_a' (donationId).");
       return NextResponse.redirect(new URL('/donations?error=missing_id', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'));
    }
    
    const redirectUrl = new URL(`/donations/invoice/${donationId}`, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002');

    if (status === 'VALID') {
        const validationData = await validatePayment(val_id);

        if (validationData.status === 'VALID' || validationData.status === 'VALIDATED') {
             // Use a transaction to ensure atomicity
            await runTransaction(firestore, async (transaction) => {
                const donationRef = doc(firestore, 'donations', donationId);
                const donationDoc = await transaction.get(donationRef);

                if (!donationDoc.exists() || donationDoc.data().status === 'success') {
                    // Already processed, do nothing to prevent double processing.
                    return;
                }
                
                // Update donation status
                transaction.update(donationRef, {
                    status: 'success',
                    transactionId: validationData.bank_tran_id,
                });
                
                // Update campaign's raised amount
                const campaignId = donationDoc.data().campaignId;
                if (campaignId) {
                    const campaignRef = doc(firestore, 'campaigns', campaignId);
                    transaction.update(campaignRef, {
                        raised: increment(parseFloat(validationData.amount))
                    });
                }
                
                // Update user points if applicable
                const userId = donationDoc.data().userId;
                if (userId && !donationDoc.data().isAnonymous) {
                     const userRef = doc(firestore, 'users', userId);
                     const userDoc = await transaction.get(userRef);
                     if (userDoc.exists()) {
                         const pointsEarned = Math.floor(parseFloat(validationData.amount) / 100);
                         const currentPoints = userDoc.data()?.points || 0;
                         const newTotalPoints = currentPoints + pointsEarned;
                         const newLevel = getDonorLevel(newTotalPoints);
                         
                         transaction.update(userRef, {
                             points: increment(pointsEarned),
                             level: newLevel
                         });
                     }
                }
            });

            return NextResponse.redirect(redirectUrl.toString());
        } else {
             // Validation failed, mark donation as failed
            const donationRef = doc(firestore, 'donations', donationId);
            await updateDoc(donationRef, { status: 'failed' });
            redirectUrl.searchParams.append('error', 'payment_validation_failed');
            return NextResponse.redirect(redirectUrl.toString());
        }
    } else { // FAILED or CANCELLED
         const donationRef = doc(firestore, 'donations', donationId);
         await updateDoc(donationRef, { status: status === 'FAILED' ? 'failed' : 'cancelled' });
         redirectUrl.searchParams.append('status', status === 'FAILED' ? 'failed' : 'cancelled');
         return NextResponse.redirect(redirectUrl.toString());
    }

  } catch (error: any) {
    console.error('[SSLCommerz Callback Error]', error);
    // Redirect to a generic error page or home
    const errorRedirectUrl = new URL('/donations', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002');
    errorRedirectUrl.searchParams.append('error', 'callback_processing_failed');
    return NextResponse.redirect(errorRedirectUrl.toString());
  }
}
