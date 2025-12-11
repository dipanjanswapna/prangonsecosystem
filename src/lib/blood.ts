'use client';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  runTransaction,
  increment,
  setDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { User } from 'firebase/auth';

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

export const createBloodRequest = async (
  userId: string,
  data: BloodRequestData
) => {
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

export const respondToRequest = async (requestId: string, user: User) => {
    try {
        const responseDocRef = doc(firestore, `bloodRequests/${requestId}/responses/${user.uid}`);
        await setDoc(responseDocRef, {
            userId: user.uid,
            userName: user.displayName,
            userPhotoURL: user.photoURL,
            respondedAt: serverTimestamp(),
        });
    } catch(error) {
        console.error('Error responding to request: ', error);
        throw new Error('Could not record your response.');
    }
}

export const markRequestAsFulfilled = async (
  requestId: string,
  donorId: string,
  donorName: string
) => {
  const requestRef = doc(firestore, 'bloodRequests', requestId);
  const donorRef = doc(firestore, 'users', donorId);

  try {
    await runTransaction(firestore, async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists()) {
        throw 'Request does not exist!';
      }

      const donorDoc = await transaction.get(donorRef);
      if (!donorDoc.exists()) {
        throw 'Donor user does not exist!';
      }

      // Update the request status
      transaction.update(requestRef, {
        status: 'fulfilled',
        donorId: donorId,
        donorName: donorName,
      });

      // Award points to the donor
      transaction.update(donorRef, {
        points: increment(10),
        totalDonations: increment(1),
        lastDonationDate: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Transaction failed: ', error);
    throw new Error('Failed to mark request as fulfilled.');
  }
};

export const updateBloodRequestStatus = async (
  requestId: string,
  status: 'fulfilled' | 'closed'
) => {
  const requestRef = doc(firestore, 'bloodRequests', requestId);
  try {
    await updateDoc(requestRef, { status });
  } catch (error) {
    console.error('Error updating blood request status: ', error);
    throw new Error('Could not update request status.');
  }
};
