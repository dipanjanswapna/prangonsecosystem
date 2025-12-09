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
import { doc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';

// Initialize Firebase and get the auth instance
const { firebaseApp } = initializeFirebase();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export const signUp = async (email, password, fullName): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Create a user document in Firestore
  await setDoc(doc(firestore, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    name: fullName,
    role: 'user', // Default role
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });

  return userCredential;
};

export const signIn = async (email, password): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update the last login timestamp
  await setDoc(
    doc(firestore, 'users', user.uid),
    { lastLogin: serverTimestamp() },
    { merge: true }
  );

  return userCredential;
};

export const logOut = (): Promise<void> => {
  return signOut(auth);
};
