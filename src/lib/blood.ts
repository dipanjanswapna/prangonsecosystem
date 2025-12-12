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
  getDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { User } from 'firebase/auth';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);

interface BloodRequestData {
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  donationType: 'Whole Blood' | 'Platelets' | 'Plasma';
  quantity: number;
  hospitalName: string;
  location: string;
  contactPerson: string;
  contactPhone: string;
  alternateContact?: string;
  reason: string;
  neededBy: Date;
  urgencyLevel: 'Normal' | 'Urgent' | 'Critical';
  preferredTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Anytime';
  prescriptionUrl?: string;
  notes?: string;
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
      verified: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating blood request: ', error);
    throw new Error('Could not create blood request.');
  }
};

export const updateBloodRequest = async (
  requestId: string,
  data: Partial<BloodRequestData>
) => {
    try {
        const requestDocRef = doc(firestore, 'bloodRequests', requestId);
        
        const updateData: Partial<BloodRequestData> = { ...data };

        // Firestore does not accept `undefined`. Convert to `null`.
        if (updateData.prescriptionUrl === undefined) {
            updateData.prescriptionUrl = '';
        }
        if (updateData.notes === undefined) {
            updateData.notes = '';
        }

        await updateDoc(requestDocRef, {
            ...updateData,
            updatedAt: serverTimestamp(),
        });
    } catch(error) {
        console.error('Error updating blood request: ', error);
        throw new Error('Could not update blood request.');
    }
}

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
  const bloodDonationRef = doc(collection(firestore, 'bloodDonations'));

  try {
    await runTransaction(firestore, async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists()) {
        throw 'Request does not exist!';
      }
      
      const requesterId = requestDoc.data().requesterId;

      const donorDoc = await transaction.get(donorRef);
      if (!donorDoc.exists()) {
        // If donor doc doesn't exist, we can't award points, but we can still fulfill the request.
         console.warn(`Donor profile ${donorId} not found. Cannot award points.`);
      } else {
        // Award points to the donor and update their donation stats
        transaction.update(donorRef, {
          points: increment(10),
          totalDonations: increment(1),
          lastDonationDate: serverTimestamp(),
        });
      }

      // 1. Update the request status
      transaction.update(requestRef, {
        status: 'fulfilled',
        donorId: donorId,
        donorName: donorName,
      });
      
      // 2. Create a permanent record of the blood donation
      transaction.set(bloodDonationRef, {
          donorId: donorId,
          recipientId: requesterId,
          bloodRequestId: requestId,
          donationDate: serverTimestamp(),
          notes: 'Fulfilled through platform.',
          pointsAwarded: 10
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

export const toggleBloodRequestVerification = async (requestId: string) => {
    const requestRef = doc(firestore, 'bloodRequests', requestId);
    try {
        const requestDoc = await getDoc(requestRef);
        if(!requestDoc.exists()){
            throw new Error("Request not found");
        }
        const currentStatus = requestDoc.data().verified || false;
        await updateDoc(requestRef, { verified: !currentStatus });
        return !currentStatus;
    } catch(error) {
        console.error('Error toggling blood request verification: ', error);
        throw new Error('Could not update verification status.');
    }
}

    