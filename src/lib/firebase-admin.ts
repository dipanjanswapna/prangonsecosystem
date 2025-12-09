
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const adminApps = getApps().filter(app => app.name === 'firebase-admin-app');

let adminApp: App;
let adminAuth: ReturnType<typeof getAuth>;
let adminFirestore: ReturnType<typeof getFirestore>;

// This is the critical check to ensure environment variables are loaded.
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    if (adminApps.length > 0) {
        adminApp = adminApps[0];
    } else {
        adminApp = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // The replace call is necessary to format the private key correctly
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
            }),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
        }, 'firebase-admin-app');
    }
    adminAuth = getAuth(adminApp);
    adminFirestore = getFirestore(adminApp);
} else {
    console.warn("Firebase Admin environment variables are not set. Firebase Admin features will be disabled.");
    // Provide dummy objects to prevent crashes if these are imported elsewhere
    adminAuth = {} as ReturnType<typeof getAuth>;
    adminFirestore = {} as ReturnType<typeof getFirestore>;
}


export { adminApp, adminAuth, adminFirestore };
