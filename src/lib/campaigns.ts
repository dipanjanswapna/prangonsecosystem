'use client';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { customAlphabet } from 'nanoid';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

interface CampaignData {
  title: string;
  shortDescription: string;
  description: string;
  goal: number;
  category: 'Seasonal' | 'Emergency' | 'Regular';
  imageUrl: string;
  voteOptions?: string;
  telegramLink?: string;
}

export const createCampaign = async (data: CampaignData) => {
  try {
    const campaignCollection = collection(firestore, 'campaigns');
    
    const voteOptionsArray = data.voteOptions
      ? data.voteOptions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    await addDoc(campaignCollection, {
      ...data,
      voteOptions: voteOptionsArray,
      telegramLink: data.telegramLink || null,
      slug: `${data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-')
        .slice(0, 50)}-${nanoid()}`,
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

export const updateCampaign = async (
  campaignId: string,
  data: Partial<CampaignData>
) => {
  try {
    const campaignDocRef = doc(firestore, 'campaigns', campaignId);
    
    const updateData: Partial<any> = { ...data };

    if (typeof data.voteOptions === 'string') {
      updateData.voteOptions = data.voteOptions
        ? data.voteOptions.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    }

    if (data.telegramLink !== undefined) {
      updateData.telegramLink = data.telegramLink || null;
    }


    await updateDoc(campaignDocRef, updateData);
  } catch (error) {
    console.error('Error updating campaign: ', error);
    throw new Error('Could not update campaign.');
  }
};

export const deleteCampaign = async (campaignId: string) => {
  try {
    const campaignDocRef = doc(firestore, 'campaigns', campaignId);
    await deleteDoc(campaignDocRef);
  } catch (error) {
    console.error('Error deleting campaign: ', error);
    throw new Error('Could not delete campaign.');
  }
};
