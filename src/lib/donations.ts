'use client';

import { getFirestore, collection, addDoc, serverTimestamp, doc, runTransaction, increment, type DocumentSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { customAlphabet } from 'nanoid'

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

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
    isCorporateMatch?: boolean;
    corporateName?: string;
}

const getDonorLevel = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
};

export const saveDonation = async (data: DonationData): Promise<string> => {
    try {
        const newDonationId = await runTransaction(firestore, async (transaction) => {
            const newDonationRef = doc(collection(firestore, 'donations'));
            
            transaction.set(newDonationRef, {
                ...data,
                invoiceId: nanoid(8).toUpperCase(),
                createdAt: serverTimestamp(),
            });

            if (data.userId && !data.isAnonymous) {
                const userRef = doc(firestore, 'users', data.userId);
                const pointsEarned = Math.floor(data.amount);
                
                const userDoc: DocumentSnapshot = await transaction.get(userRef);
                const currentPoints = userDoc.data()?.points || 0;
                const newTotalPoints = currentPoints + pointsEarned;
                const newLevel = getDonorLevel(newTotalPoints);
                
                transaction.update(userRef, {
                    points: increment(pointsEarned),
                    level: newLevel,
                });
            }
            
            return newDonationRef.id;
        });

        return newDonationId;

    } catch (error) {
        console.error("Error saving donation and updating points/level: ", error);
        throw new Error("Could not process your donation.");
    }
};

    