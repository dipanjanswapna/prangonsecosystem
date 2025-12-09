'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type UserCredential,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// Initialize Firebase and get the auth instance
const { auth } = initializeFirebase();

export const signUp = (email, password): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email, password): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = (): Promise<void> => {
  return signOut(auth);
};
