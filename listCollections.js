// List Firestore root collections for debugging
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: 'C:/Users/Admin/Desktop/projects/web/altarvision/.env.local' });
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});
const db = getFirestore();
(async () => {
  try {
    const collections = await db.listCollections();
    console.log('Root collections:', collections.map(c => c.id));
  } catch (e) {
    console.error('Error:', e);
  }
})();
