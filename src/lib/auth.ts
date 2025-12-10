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
    const idToken = await user.getIdToken(true); // Force refresh the token
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

  const isPrivilegedRole = ![ROLES.USER, ROLES.ADMIN].includes(role);
  const status = isPrivilegedRole ? 'pending' : 'approved';
  const profileStatus = isPrivilegedRole ? 'incomplete' : 'complete';

  // Create a user document in Firestore
  await setDoc(doc(firestore, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    name: fullName,
    role: role,
    status: status,
    profile_status: profileStatus,
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

  if (!userDoc.exists()) {
    // IMPORTANT: Use your actual admin email here.
    const isAdmin = user.email === 'dipanjansarkarprangon@gmail.com'; 
    const role = isAdmin ? ROLES.ADMIN : ROLES.USER;

    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      role: role,
      status: 'approved',
      profile_status: 'complete',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    // If user already exists, just update their last login
    await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
  }
  
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
  window.location.href = '/';
};


export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const updateUserRoleAndStatus = async (uid: string, role: Role, status: 'pending' | 'approved' | 'rejected') => {
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, { role, status }, { merge: true });
};

export const updateUserProfileStatus = async (uid: string, profileStatus: 'incomplete' | 'pending_review' | 'complete') => {
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, { profile_status: profileStatus }, { merge: true });
};

export const updateUserProfile = async (uid: string, data: any) => {
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, { 
        ...data,
        profile_status: 'pending_review',
        profileUpdatedAt: serverTimestamp(),
     }, { merge: true });
};

export const deleteUserAccount = async (uid: string) => {
  const response = await fetch(`/api/users/${uid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user');
  }

  return await response.json();
};
