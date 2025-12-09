'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  type Auth,
  type UserCredential,
  type User,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore } from 'firebase/firestore';

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

export const signIn = async (email, password, rememberMe): Promise<UserCredential> => {
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

const handleSocialSignIn = async (user: User) => {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    // User already exists, just update last login
    await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
  } else {
    // New user, create a document
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      role: 'user', // Default role
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  }
};


export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  await handleSocialSignIn(userCredential.user);
  return userCredential;
};


export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};
