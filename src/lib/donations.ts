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
            const newDonationRef = doc(collection(firestore, 'donations'));
            const campaignRef = doc(firestore, 'campaigns', data.campaignId);
            const invoiceId = `ONGN-${nanoid()}`;
            
            const donationPayload: any = {
                ...data,
                invoiceId: invoiceId,
                createdAt: serverTimestamp(),
                status: 'success', // Simulating successful payment for now
            };

            // Only include corporateName if it's a corporate match and has a value
            if (data.isCorporateMatch && data.corporateName) {
                donationPayload.corporateName = data.corporateName;
            } else {
                // Ensure corporateName is not in the payload if not applicable
                delete donationPayload.corporateName;
            }

            transaction.set(newDonationRef, donationPayload);
            
            // Increment the 'raised' amount on the campaign
            transaction.update(campaignRef, {
                raised: increment(data.amount)
            });

            // If the donation is tied to a user and not anonymous, update points and level
            if (data.userId && !data.isAnonymous) {
                const userRef = doc(firestore, 'users', data.userId);
                const pointsEarned = Math.floor(data.amount); // 1 BDT = 1 Point
                
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

        // The transaction was successful, return the new donation ID
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
    
