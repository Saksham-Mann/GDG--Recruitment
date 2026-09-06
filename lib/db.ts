import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";


interface FirestoreConn {
  db: Firestore | null;
}

let cached: FirestoreConn = (globalThis as any).firestore;

if (!cached) {
  cached = (globalThis as any).firestore = {
    db: null,
  };
}

export const connect = async (): Promise<Firestore> => {
  if (cached.db) return cached.db;

  const projectId = process.env.FIREBASE_PROJECT_ID || "demo-DWASFW-rec";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Strip surrounding quotes if present from .env formatting
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const googleAppCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const hasServiceAccount = Boolean(projectId && clientEmail && privateKey);
  const hasCredentials = hasServiceAccount || Boolean(googleAppCreds) || isEmulator;

  if (!hasCredentials && process.env.NODE_ENV === "production" && !process.env.BUILDING) {
    throw new Error(
      "Please define GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local",
    );
  }

  const appOptions: any = { projectId };

  if (clientEmail && privateKey) {
    appOptions.credential = cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(appOptions);

  cached.db = getFirestore(app);
  try {
    cached.db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Settings already applied or Firestore already started
  }

  console.log("Connected to Firestore");
  return cached.db;
};

export const serializeFirestoreData = (value: any): any => {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreData(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        serializeFirestoreData(item),
      ]),
    );
  }

  return value;
};
