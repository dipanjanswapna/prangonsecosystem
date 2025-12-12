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
  arrayUnion,
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
        
        const updateData: Partial<BloodRequestData & { updatedAt: any }> = { ...data };

        // Firestore does not accept `undefined`. Convert to `null`.
        if (updateData.prescriptionUrl === undefined) {
            updateData.prescriptionUrl = null;
        }
        if (updateData.notes === undefined) {
            updateData.notes = null;
        }
        
        updateData.updatedAt = serverTimestamp();

        await updateDoc(requestDocRef, updateData as any);
    } catch(error) {
        console.error('Error updating blood request: ', error);
        throw new Error('Could not update blood request.');
    }
}

export const respondToRequest = async (requestId: string, user: User) => {
    const responseDocRef = doc(firestore, `bloodRequests/${requestId}/responses/${user.uid}`);
    const userRef = doc(firestore, 'users', user.uid);
    try {
        await runTransaction(firestore, async (transaction) => {
            const responseDoc = await transaction.get(responseDocRef);
            if (responseDoc.exists()) {
                throw new Error("You have already responded to this request.");
            }

            // 1. Add the response document
            transaction.set(responseDocRef, {
                userId: user.uid,
                userName: user.displayName,
                userPhotoURL: user.photoURL,
                respondedAt: serverTimestamp(),
            });

            // 2. Award 2 points to the user for responding
            transaction.update(userRef, {
                points: increment(2),
                requestResponses: arrayUnion(requestId)
            });
        });
    } catch(error) {
        console.error('Error responding to request: ', error);
        throw error;
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
      
      const requesterId = requestDoc.data().requesterId;
      const requesterRef = doc(firestore, 'users', requesterId);
      const bloodDonationRef = doc(collection(firestore, 'bloodDonations'));

      const donorDoc = await transaction.get(donorRef);
      if (!donorDoc.exists()) {
         console.warn(`Donor profile ${donorId} not found. Cannot award points.`);
      } else {
        // Award 10 points to the donor and update their donation stats
        transaction.update(donorRef, {
          points: increment(10), // +10 points for successful donation
          totalDonations: increment(1),
          lastDonationDate: serverTimestamp(),
          donationHistory: arrayUnion({
              date: serverTimestamp(),
              location: requestDoc.data().hospitalName,
              requestId: requestId,
          })
        });
      }

      // 1. Update the request status
      transaction.update(requestRef, {
        status: 'fulfilled',
        donorId: donorId,
        donorName: donorName,
      });
      
      // 2. Award "Gratitude Badge" to the request creator
      transaction.update(requesterRef, {
          badges: arrayUnion('Gratitude Badge')
      });
      
      // 3. Create a permanent record of the blood donation
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