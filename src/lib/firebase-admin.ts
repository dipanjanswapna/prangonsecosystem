
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const adminApps = getApps().filter(app => app.name === 'firebase-admin-app');

let adminApp: App;
let adminAuth: ReturnType<typeof getAuth>;
let adminFirestore: ReturnType<typeof getFirestore>;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  if (adminApps.length > 0) {
    adminApp = adminApps[0];
  } else {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          // The replace call is necessary to format the private key correctly from a single-line env var.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
      }, 'firebase-admin-app');
    } catch (e: any) {
        console.error("Firebase Admin SDK Initialization Error:", e.message);
    }
  }
  
  if(adminApp!) {
    adminAuth = getAuth(adminApp);
    adminFirestore = getFirestore(adminApp);
  } else {
    // Provide dummy objects to prevent crashes if these are imported elsewhere
    adminAuth = {} as ReturnType<typeof getAuth>;
    adminFirestore = {} as ReturnType<typeof getFirestore>;
  }

} else {
  console.warn("Firebase Admin environment variables are not set. Server-side features will be disabled.");
  // Provide dummy objects to prevent crashes if these are imported elsewhere
  adminAuth = {} as ReturnType<typeof getAuth>;
  adminFirestore = {} as ReturnType<typeof getFirestore>;
}


export { adminApp, adminAuth, adminFirestore };
