'use client';

import { getFirestore, collection, addDoc, serverTimestamp, doc, runTransaction, increment } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { customAlphabet } from 'nanoid'

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('1234567890abcdef', 10);

interface DonationData {
    userId: string | null;
    campaignId: string;
    campaignTitle: string;
    amount: number;
    currency: string;
    gateway: string;
    status: 'pending' | 'success' | 'failed';
    isAnonymous: boolean;
    donorName: string;
    donorEmail: string | null;
}

export const saveDonation = async (data: DonationData): Promise<string> => {
    try {
        const newDonationId = await runTransaction(firestore, async (transaction) => {
            // 1. Define references
            const newDonationRef = doc(collection(firestore, 'donations'));
            
            // 2. Create the new donation document
            transaction.set(newDonationRef, {
                ...data,
                id: nanoid(), // Add a user-friendly ID
                createdAt: serverTimestamp(),
            });

            // 3. If the user is logged in and not anonymous, update their points
            if (data.userId && !data.isAnonymous) {
                const userRef = doc(firestore, 'users', data.userId);
                // Simple point system: 1 point per 1 unit of currency
                const pointsEarned = Math.floor(data.amount);
                
                transaction.update(userRef, {
                    points: increment(pointsEarned)
                });
            }
            
            return newDonationRef.id;
        });

        return newDonationId;

    } catch (error) {
        console.error("Error saving donation and updating points: ", error);
        throw new Error("Could not process your donation.");
    }
};
