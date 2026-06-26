// Seed initial categories into Firestore
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const db = getFirestore();

const categories = [
  { name: 'ChatGPT', slug: 'chatgpt', description: 'Prompts optimized for ChatGPT conversations and tasks', image: '' },
  { name: 'Midjourney', slug: 'midjourney', description: 'AI art prompts for Midjourney image generation', image: '' },
  { name: 'DALL·E', slug: 'dall-e', description: 'Creative prompts for DALL·E image generation', image: '' },
  { name: 'Stable Diffusion', slug: 'stable-diffusion', description: 'Prompts for Stable Diffusion models', image: '' },
  { name: 'Claude', slug: 'claude', description: 'Prompts designed for Anthropic Claude', image: '' },
  { name: 'Gemini', slug: 'gemini', description: 'Prompts crafted for Google Gemini', image: '' },
  { name: 'Coding', slug: 'coding', description: 'Programming and development prompts', image: '' },
  { name: 'Marketing', slug: 'marketing', description: 'Marketing, copywriting and business prompts', image: '' },
  { name: 'Writing', slug: 'writing', description: 'Creative writing, blogging and content prompts', image: '' },
  { name: 'Productivity', slug: 'productivity', description: 'Prompts for productivity and workflow automation', image: '' },
];

async function seed() {
  const batch = db.batch();
  const now = new Date();

  for (const cat of categories) {
    const ref = db.collection('categories').doc();
    batch.set(ref, {
      ...cat,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`✅ Seeded ${categories.length} categories successfully!`);

  // Verify
  const snapshot = await db.collection('categories').orderBy('name', 'asc').get();
  console.log('\nCategories in Firestore:');
  snapshot.docs.forEach((doc) => {
    console.log(`  - ${doc.data().name} (${doc.id})`);
  });
}

seed().catch(console.error);
