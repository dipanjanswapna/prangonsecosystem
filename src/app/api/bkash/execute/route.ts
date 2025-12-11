
'use server';

import { executePayment, queryPayment } from '@/lib/bkash';
import { NextResponse, type NextRequest } from 'next/server';
import { getFirestore, doc, runTransaction, increment } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);

const getDonorLevel = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
};

export async function POST(request: NextRequest) {
  try {
    const { paymentID, ongon_donation_id } = await request.json();

    if (!paymentID || !ongon_donation_id) {
        return NextResponse.json({ message: 'Missing paymentID or donationId' }, { status: 400 });
    }

    const executeResponse = await executePayment(paymentID);

    if (executeResponse.statusCode === '0000' && executeResponse.transactionStatus === 'Completed') {
        // Payment successful, now update Firestore atomically
        await runTransaction(firestore, async (transaction) => {
            const donationRef = doc(firestore, 'donations', ongon_donation_id);
            const donationDoc = await transaction.get(donationRef);

            if (!donationDoc.exists() || donationDoc.data().status === 'success') {
                // Already processed or does not exist
                return;
            }

            const { campaignId, amount, userId, isAnonymous } = donationDoc.data();

            // 1. Update donation status
            transaction.update(donationRef, {
                status: 'success',
                transactionId: executeResponse.trxID,
            });

            // 2. Update campaign's raised amount
            if (campaignId) {
                const campaignRef = doc(firestore, 'campaigns', campaignId);
                transaction.update(campaignRef, {
                    raised: increment(parseFloat(amount))
                });
            }

            // 3. Update user points if applicable
            if (userId && !isAnonymous) {
                 const userRef = doc(firestore, 'users', userId);
                 const userDoc = await transaction.get(userRef);
                 if (userDoc.exists()) {
                     const pointsEarned = Math.floor(parseFloat(amount) / 100);
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
        
        return NextResponse.json({ 
            message: 'Payment executed and database updated successfully.',
            trxID: executeResponse.trxID
        });

    } else {
        // If execution fails, query the payment to be sure
        const queryResponse = await queryPayment(paymentID);
        if (queryResponse.transactionStatus === 'Completed') {
            // It was actually completed, so we should treat it as success.
            // This logic can be expanded, for now, we'll return success to client.
            return NextResponse.json({ 
                message: 'Payment was already completed.',
                trxID: queryResponse.trxID
             });
        }
      
        // Mark donation as failed in Firestore
        const donationRef = doc(firestore, 'donations', ongon_donation_id);
        await runTransaction(firestore, async (transaction) => {
            transaction.update(donationRef, { status: 'failed' });
        });

        throw new Error(executeResponse.statusMessage || 'bKash payment execution failed.');
    }
  } catch (error: any) {
    console.error('[bKash Execute API Error]', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
