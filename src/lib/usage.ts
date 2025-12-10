'use client';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);

interface UsageData {
  campaignId: string;
  campaignTitle: string;
  category: 'education' | 'health' | 'logistics' | 'food' | 'shelter';
  description: string;
  cost: number;
  vendor?: string;
}

export const addUsageItem = async (data: UsageData) => {
  try {
    const usageCollection = collection(
      firestore,
      `campaigns/${data.campaignId}/usageItems`
    );
    const globalUsageCollection = collection(firestore, 'usageItems');
    
    const usageDocData = {
        ...data,
        spentAt: serverTimestamp(),
    }

    // Add to nested collection for per-campaign reports
    await addDoc(usageCollection, usageDocData);
    
    // Add to global collection for admin overview
    await addDoc(globalUsageCollection, usageDocData);

  } catch (error) {
    console.error('Error adding usage item: ', error);
    throw new Error('Could not log expenditure.');
  }
};
