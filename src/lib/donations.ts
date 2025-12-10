'use client';

import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
        const donationCollection = collection(firestore, 'donations');
        const newDonationRef = await addDoc(donationCollection, {
            ...data,
            id: nanoid(), // Add a user-friendly ID
            createdAt: serverTimestamp(),
            // invoiceId will be generated after payment success
        });
        return newDonationRef.id;
    } catch (error) {
        console.error("Error saving donation: ", error);
        throw new Error("Could not save donation to the database.");
    }
};
