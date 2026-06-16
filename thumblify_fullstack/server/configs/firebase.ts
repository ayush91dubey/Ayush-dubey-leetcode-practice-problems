import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);

initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();
export default db;