'use client';

import { getFirestore, collection, addDoc, serverTimestamp, doc, runTransaction, increment, type DocumentSnapshot, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { customAlphabet } from 'nanoid'

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)

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
            let userRef;
            let userDoc: DocumentSnapshot | null = null;
            
            // --- READ PHASE ---
            if (data.userId && !data.isAnonymous) {
                userRef = doc(firestore, 'users', data.userId);
                userDoc = await transaction.get(userRef);
            }

            // --- WRITE PHASE ---
            const newDonationRef = doc(collection(firestore, 'donations'));
            const campaignRef = doc(firestore, 'campaigns', data.campaignId);
            const invoiceId = `ONGN-${nanoid()}`;

            const donationPayload: any = {
                ...data,
                invoiceId: invoiceId,
                createdAt: serverTimestamp(),
                status: 'success', // Simulating successful payment for now
            };
            
            if (!donationPayload.isCorporateMatch) {
                delete donationPayload.corporateName;
            }

            // Write 1: Create the new donation document.
            transaction.set(newDonationRef, donationPayload);
            
            // Write 2: Increment the 'raised' amount on the campaign.
            transaction.update(campaignRef, {
                raised: increment(data.amount)
            });

            // Write 3: If user doc was read, update user's points and level.
            if (userRef && userDoc && userDoc.exists()) {
                const pointsEarned = Math.floor(data.amount / 1);
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

export const updateDonationStatus = async (donationId: string, status: 'success' | 'failed' | 'refunded') => {
    const donationRef = doc(firestore, 'donations', donationId);
    await updateDoc(donationRef, { status });
}
    
