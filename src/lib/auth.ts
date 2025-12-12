'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  type Auth,
  type UserCredential,
  type User,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, getFirestore, updateDoc } from 'firebase/firestore';
import { ROLES, type Role } from '@/lib/roles';
import { customAlphabet } from 'nanoid';

// Initialize Firebase and get the auth instance
const { firebaseApp } = initializeFirebase();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);


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

export const signUp = async (email:string, password:string, fullName:string, role: Role, refCode?: string | null): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  
  await updateFirebaseProfile(user, { displayName: fullName });

  const isPrivilegedRole = ![ROLES.USER, ROLES.ADMIN, ROLES.VOLUNTEER].includes(role);
  let status = isPrivilegedRole ? 'pending' : 'approved';
  let profileStatus = isPrivilegedRole ? 'incomplete' : 'complete';
  
  let volunteerStatus = 'none';
  let isVolunteer = false;
  if (role === ROLES.VOLUNTEER) {
    volunteerStatus = 'pending';
    isVolunteer = true;
    role = ROLES.USER; // Volunteers are fundamentally users with an extra flag
    status = 'approved';
    profileStatus = 'complete';
  }


  // Create a user document in Firestore
  await setDoc(doc(firestore, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    name: fullName,
    role: role,
    status: status,
    profile_status: profileStatus,
    isVolunteer: isVolunteer,
    volunteerStatus: volunteerStatus,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    photoURL: user.photoURL,
    referralCode: nanoid(),
    referredBy: refCode || null,
    level: 'Bronze',
    points: 0,
    badges: [],
    skills: [],
    phone: '',
  });

  return userCredential;
};

export const signIn = async (email:string, password:string, rememberMe:boolean): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update the last login timestamp
  // Use setDoc with merge to avoid "No document to update" error if doc doesn't exist yet
  await setDoc(
    doc(firestore, 'users', user.uid),
    { lastLogin: serverTimestamp() },
    { merge: true }
  );
  
  await createSession(user, rememberMe);

  return userCredential;
};

const handleSocialSignIn = async (user: User, refCode?: string | null) => {
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
      isVolunteer: false,
      volunteerStatus: 'none',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      referralCode: nanoid(),
      referredBy: refCode || null,
      level: 'Bronze',
      points: 0,
      badges: [],
      skills: [],
      phone: user.phoneNumber || '',
    });
  } else {
    // If user already exists, just update their last login
    await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
  }
  
  await createSession(user, true);
};


export const signInWithGoogle = async (refCode?: string | null): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  await handleSocialSignIn(userCredential.user, refCode);
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
    await updateDoc(userDocRef, { role, status });
};

export const updateUserVolunteerStatus = async (uid: string, volunteerStatus: 'approved' | 'rejected') => {
    const userDocRef = doc(firestore, 'users', uid);
    const isApproved = volunteerStatus === 'approved';
    await updateDoc(userDocRef, { 
      volunteerStatus: volunteerStatus, 
      // If approved, ensure isVolunteer is true. If rejected, it remains true to indicate they applied.
      isVolunteer: isApproved ? true : true 
    });
};


export const updateUserProfileStatus = async (uid: string, profileStatus: 'incomplete' | 'pending_review' | 'complete') => {
    const userDocRef = doc(firestore, 'users', uid);
    await updateDoc(userDocRef, { profile_status: profileStatus });
};

export const updateUserProfile = async (uid: string, data: any) => {
    const userDocRef = doc(firestore, 'users', uid);
    const updateData: Record<string, any> = {
        ...data,
        profileUpdatedAt: serverTimestamp(),
    };
    
    const userProfile = await getDoc(userDocRef);
    const role = userProfile.data()?.role;
    const isPrivilegedRole = ![ROLES.USER, ROLES.ADMIN].includes(role);

    // Only set profile status to pending_review if it's not a simple name/phone/bloodgroup update
    if (isPrivilegedRole && Object.keys(data).some(key => !['name', 'phone', 'bloodGroup'].includes(key))) {
        updateData.profile_status = 'pending_review';
    }

    await updateDoc(userDocRef, updateData);

    const user = auth.currentUser;
    if (user && user.uid === uid && data.name) {
        await updateFirebaseProfile(user, { displayName: data.name });
    }
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

export const resetUserPoints = async (uid: string) => {
    const userDocRef = doc(firestore, 'users', uid);
    await updateDoc(userDocRef, {
        points: 0,
        level: 'Bronze',
        lastGiftClaimedAt: serverTimestamp(),
    });
};
