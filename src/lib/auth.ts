'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
  type UserCredential,
  type User,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { ROLES, type Role } from '@/lib/roles';

// Initialize Firebase and get the auth instance
const { firebaseApp } = initializeFirebase();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);


const createSession = async (user: User, rememberMe: boolean): Promise<void> => {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, rememberMe }),
    });
};

export const signUp = async (email:string, password:string, fullName:string, role: Role): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  
  await updateProfile(user, { displayName: fullName });

  // Admins and Users are approved by default. Other roles require admin approval.
  const status = (role === ROLES.USER || role === ROLES.ADMIN) ? 'approved' : 'pending';

  // Create a user document in Firestore
  await setDoc(doc(firestore, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    name: fullName,
    role: role,
    status: status,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    photoURL: user.photoURL
  });

  return userCredential;
};

export const signIn = async (email:string, password:string, rememberMe:boolean): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update the last login timestamp
  await setDoc(
    doc(firestore, 'users', user.uid),
    { lastLogin: serverTimestamp() },
    { merge: true }
  );
  
  await createSession(user, rememberMe);

  return userCredential;
};

const handleSocialSignIn = async (user: User) => {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    // If user already exists, just update their last login
    await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
  } else {
    // For new social sign-ins, determine role.
    // IMPORTANT: Use your actual admin email here.
    const isAdmin = user.email === 'dipanjansarkarprangon@gmail.com'; 
    const role = isAdmin ? ROLES.ADMIN : ROLES.USER;

    // For new social sign-ups (admin or user), status is always 'approved'.
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      role: role,
      status: 'approved',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  }
  
  // Create session AFTER firestore doc is guaranteed to exist.
  await createSession(user, true);
};


export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  await handleSocialSignIn(userCredential.user);
  return userCredential;
};


export const logOut = async (): Promise<void> => {
  await signOut(auth);
  // Fetch to clear the session cookie on the server
  await fetch('/api/auth/session', { method: 'DELETE' });
  // Force a hard reload to clear all client-side state and re-evaluate auth
  window.location.href = '/';
};


export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const updateUserRoleAndStatus = async (uid: string, role: Role, status: 'pending' | 'approved' | 'rejected') => {
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, { role, status }, { merge: true });
};
