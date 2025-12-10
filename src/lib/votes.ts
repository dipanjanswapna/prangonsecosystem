'use client';

import {
  getFirestore,
  setDoc,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);


export const castVote = async (
  userId: string,
  campaignId: string,
  category: string
) => {
  if (!userId) {
    throw new Error('You must be logged in to vote.');
  }

  try {
    // Create a predictable document ID to ensure one vote per user per campaign
    const voteDocRef = doc(firestore, 'votes', `${userId}_${campaignId}`);
    
    await setDoc(voteDocRef, {
      userId,
      campaignId,
      category,
      votedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error('Error casting vote: ', error);
    throw new Error('Could not cast your vote.');
  }
};
