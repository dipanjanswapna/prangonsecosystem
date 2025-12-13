'use client';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  type Timestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { customAlphabet } from 'nanoid';

const { firebaseApp } = initializeFirebase();
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

interface PlanData {
  name: string;
  description: string;
  tier: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  active: boolean;
  features: string;
  projectsLimit: number;
  seatsLimit: number;
}

interface PriceData {
    planId: string;
    amount: number;
    currency: 'BDT' | 'USD';
    interval: 'month' | 'year' | 'lifetime';
    active: boolean;
}

interface SubscriptionData {
    userId: string;
    planId: string;
    priceId: string;
    status: 'pending' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
}

export const createPlan = async (data: PlanData) => {
  try {
    const planCollection = collection(firestore, 'plans');

    const featuresArray = data.features
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = `${data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)}-${nanoid(5)}`;

    await addDoc(planCollection, {
      name: data.name,
      slug: slug,
      description: data.description,
      tier: data.tier,
      active: data.active,
      features: featuresArray,
      limits: {
        projects: data.projectsLimit,
        seats: data.seatsLimit,
      },
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating plan: ', error);
    throw new Error('Could not create plan.');
  }
};

export const updatePlan = async (
  planId: string,
  data: Partial<PlanData>
) => {
  try {
    const planDocRef = doc(firestore, 'plans', planId);

    const updateData: Partial<any> = {
        name: data.name,
        description: data.description,
        tier: data.tier,
        active: data.active,
        limits: {
            projects: data.projectsLimit,
            seats: data.seatsLimit,
        }
    };

    if (typeof data.features === 'string') {
      updateData.features = data.features
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    await updateDoc(planDocRef, updateData);
  } catch (error) {
    console.error('Error updating plan: ', error);
    throw new Error('Could not update plan.');
  }
};

export const deletePlan = async (planId: string) => {
  try {
    const planDocRef = doc(firestore, 'plans', planId);
    await deleteDoc(planDocRef);
  } catch (error) {
    console.error('Error deleting plan: ', error);
    throw new Error('Could not delete plan.');
  }
};


export const createPrice = async (data: PriceData) => {
    try {
        const priceCollection = collection(firestore, 'prices');
        const planDocRef = doc(firestore, 'plans', data.planId);
        const planDoc = await getDoc(planDocRef);

        if(!planDoc.exists()) {
            throw new Error('Selected plan does not exist.');
        }

        await addDoc(priceCollection, {
            ...data,
            planName: planDoc.data().name,
            createdAt: serverTimestamp(),
        });
    } catch(error) {
        console.error('Error creating price: ', error);
        throw new Error('Could not create price.');
    }
}

export const updatePrice = async (priceId: string, data: Partial<PriceData>) => {
    try {
        const priceDocRef = doc(firestore, 'prices', priceId);
        
        const updateData: Partial<any> = { ...data };

        if (data.planId) {
            const planDocRef = doc(firestore, 'plans', data.planId);
            const planDoc = await getDoc(planDocRef);
            if(!planDoc.exists()) {
                throw new Error('Selected plan does not exist.');
            }
            updateData.planName = planDoc.data().name;
        }

        await updateDoc(priceDocRef, updateData);
    } catch(error) {
        console.error('Error updating price: ', error);
        throw new Error('Could not update price.');
    }
}

export const deletePrice = async (priceId: string) => {
    try {
        const priceDocRef = doc(firestore, 'prices', priceId);
        await deleteDoc(priceDocRef);
    } catch (error) {
        console.error('Error deleting price: ', error);
        throw new Error('Could not delete price.');
    }
}


export const createSubscription = async (data: SubscriptionData): Promise<string> => {
    const userSubscriptionsRef = collection(firestore, 'users', data.userId, 'subscriptions');
    
    // Set a grace period of 7 days for the first payment.
    const now = new Date();
    const currentPeriodStart = serverTimestamp();
    const currentPeriodEnd = new Date(now.setDate(now.getDate() + 7));


    const subscriptionDoc = await addDoc(userSubscriptionsRef, {
        ...data,
        createdAt: serverTimestamp(),
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
    });
    
    return subscriptionDoc.id;
}
