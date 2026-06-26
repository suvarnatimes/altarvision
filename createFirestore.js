// Script to create the Firestore database via REST API using service account credentials
const https = require('https');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);
console.log('Private Key loaded:', !!privateKey);

async function createFirestoreDatabase() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken()).token;

  // First, check if the database already exists
  console.log('\n--- Checking if database exists ---');
  
  const checkResult = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${projectId}/databases/(default)`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log('Check status:', checkResult.status);
  console.log('Check body:', checkResult.body);

  if (checkResult.status === 200) {
    console.log('\n✅ Database already exists!');
    const dbInfo = JSON.parse(checkResult.body);
    console.log('Database info:', JSON.stringify(dbInfo, null, 2));
    return;
  }

  // Create the database
  console.log('\n--- Creating Firestore database ---');
  
  const body = JSON.stringify({
    type: 'FIRESTORE_NATIVE',
    locationId: 'asia-south1', // India region
  });

  const createResult = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${projectId}/databases?databaseId=(default)`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  console.log('Create status:', createResult.status);
  console.log('Create response:', createResult.body);
  
  if (createResult.status === 200 || createResult.status === 202) {
    console.log('\n✅ Firestore database created successfully!');
  } else {
    console.log('\n❌ Failed to create database. See response above.');
    console.log('\nIf this fails, please go to:');
    console.log('https://console.firebase.google.com/project/altarvision-96e59/firestore');
    console.log('and click "Create database" manually.');
  }
}

createFirestoreDatabase().catch(console.error);
