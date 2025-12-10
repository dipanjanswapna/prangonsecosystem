'use client';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { customAlphabet } from 'nanoid';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

interface CampaignData {
  title: string;
  description: string;
  goal: number;
  category: 'Seasonal' | 'Emergency' | 'Regular';
  imageId: string;
}

export const createCampaign = async (data: CampaignData) => {
  try {
    const campaignCollection = collection(firestore, 'campaigns');
    await addDoc(campaignCollection, {
      ...data,
      slug: `${data.title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}-${nanoid()}`,
      raised: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      createdBy: 'admin', // In a real app, this would be the current user's UID
    });
  } catch (error) {
    console.error('Error creating campaign: ', error);
    throw new Error('Could not create campaign.');
  }
};
