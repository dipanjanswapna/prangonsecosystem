'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getFirestore, doc, updateDoc, runTransaction, increment } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import crypto from 'crypto';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);

const SSLCOMMERZ_VALIDATION_API = process.env.NODE_ENV === 'production' 
  ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;

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


export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const status = body.get('status');
    const tran_id = body.get('tran_id') as string;
    const val_id = body.get('val_id') as string;
    const amount = parseFloat(body.get('amount') as string);
    const donationId = body.get('value_a') as string;

    if (!donationId) {
       return NextResponse.json({ message: 'Donation ID is missing.' }, { status: 400 });
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
                    // Already processed, do nothing.
                    return;
                }
                
                // Update donation status
                transaction.update(donationRef, {
                    status: 'success',
                    transactionId: validationData.bank_tran_id,
                });
                
                // Update campaign's raised amount
                const campaignId = donationDoc.data().campaignId;
                const campaignRef = doc(firestore, 'campaigns', campaignId);
                transaction.update(campaignRef, {
                    raised: increment(parseFloat(validationData.amount))
                });
                
                // Update user points if applicable
                const userId = donationDoc.data().userId;
                if (userId && !donationDoc.data().isAnonymous) {
                     const userRef = doc(firestore, 'users', userId);
                     const pointsEarned = Math.floor(parseFloat(validationData.amount) / 100);
                     transaction.update(userRef, {
                         points: increment(pointsEarned),
                     });
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
    const errorRedirectUrl = new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002');
    errorRedirectUrl.searchParams.append('error', 'callback_processing_failed');
    return NextResponse.redirect(errorRedirectUrl.toString());
  }
}
