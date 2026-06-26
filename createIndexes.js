// Create all composite Firestore indexes using the REST API
const https = require('https');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const indexes = [
  { collection: 'prompts', fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'prompts', fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'featured', order: 'ASCENDING' },
  ]},
  { collection: 'prompts', fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'categoryId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'prompts', fields: [
    { fieldPath: 'slug', order: 'ASCENDING' },
    { fieldPath: 'status', order: 'ASCENDING' },
  ]},
  { collection: 'prompts', fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'featured', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'orders', fields: [
    { fieldPath: 'paymentStatus', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'orders', fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'orders', fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'paymentStatus', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'reviews', fields: [
    { fieldPath: 'promptId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'reviews', fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'promptId', order: 'ASCENDING' },
  ]},
  { collection: 'favorites', fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'downloads', fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'downloadedAt', order: 'DESCENDING' },
  ]},
  { collection: 'supportTickets', fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' },
  ]},
  { collection: 'coupons', fields: [
    { fieldPath: 'code', order: 'ASCENDING' },
    { fieldPath: 'active', order: 'ASCENDING' },
  ]},
  { collection: 'bundles', fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'title', order: 'ASCENDING' },
  ]},
];

async function createIndexes() {
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken()).token;

  const basePath = `/v1/projects/${projectId}/databases/(default)/collectionGroups`;

  for (const idx of indexes) {
    const desc = `${idx.collection}: [${idx.fields.map(f => f.fieldPath).join(', ')}]`;
    const body = JSON.stringify({
      queryScope: 'COLLECTION',
      fields: idx.fields,
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `${basePath}/${idx.collection}/indexes`,
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

    if (result.status === 200) {
      console.log(`✅ Created: ${desc}`);
    } else if (result.status === 409) {
      console.log(`⏭️  Already exists: ${desc}`);
    } else {
      const parsed = JSON.parse(result.body);
      console.log(`❌ Failed (${result.status}): ${desc} — ${parsed.error?.message || result.body}`);
    }
  }

  console.log('\n🎉 Done! Indexes may take 2-5 minutes to finish building.');
  console.log('Check status at: https://console.firebase.google.com/project/altarvision-96e59/firestore/indexes');
}

createIndexes().catch(console.error);
