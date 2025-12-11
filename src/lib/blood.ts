'use client';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);

interface BloodRequestData {
  patientName: string;
  bloodGroup: string;
  quantity: number;
  hospitalName: string;
  location: string;
  contactPerson: string;
  contactPhone: string;
  reason: string;
  neededBy: Date;
}

export const createBloodRequest = async (userId: string, data: BloodRequestData) => {
  try {
    const requestCollection = collection(firestore, 'bloodRequests');
    
    await addDoc(requestCollection, {
      ...data,
      requesterId: userId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating blood request: ', error);
    throw new Error('Could not create blood request.');
  }
};
