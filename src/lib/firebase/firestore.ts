import { db } from "./config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import {
  Prompt,
  Category,
  Bundle,
  Order,
  Download,
  Favorite,
  Review,
  SupportTicket,
  User,
} from "@/types";

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  const querySnapshot = await getDocs(
    query(collection(db, "categories"), orderBy("name", "asc"))
  );
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Category)
  );
}

// --- PROMPTS ---
export interface GetPromptsOptions {
  categoryId?: string;
  searchQuery?: string;
  sortBy?: "newest" | "price-low" | "price-high" | "popular";
  limitCount?: number;
  featuredOnly?: boolean;
}

export async function getPrompts(options: GetPromptsOptions = {}): Promise<Prompt[]> {
  const { categoryId, searchQuery, sortBy, limitCount, featuredOnly } = options;
  let q = query(
    collection(db, "prompts"),
    where("status", "==", "published")
  );

  if (featuredOnly) {
    q = query(q, where("featured", "==", true));
  }

  if (categoryId) {
    q = query(q, where("categoryId", "==", categoryId));
  }

  const querySnapshot = await getDocs(q);
  let prompts = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Prompt)
  );

  // Client-side text search (Firestore doesn't support full-text search out of the box easily)
  if (searchQuery) {
    const term = searchQuery.toLowerCase();
    prompts = prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  // Sort
  if (sortBy === "price-low") {
    prompts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    prompts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "newest") {
    prompts.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  }

  if (limitCount) {
    prompts = prompts.slice(0, limitCount);
  }

  return prompts;
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
  const q = query(
    collection(db, "prompts"),
    where("slug", "==", slug),
    where("status", "==", "published"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Prompt;
}

// --- BUNDLES ---
export async function getBundles(): Promise<Bundle[]> {
  const querySnapshot = await getDocs(
    query(collection(db, "bundles"), orderBy("createdAt", "desc"))
  );
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bundle));
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  const docRef = doc(db, "bundles", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bundle;
}

// --- FAVORITES (WISHLIST) ---
export async function getFavorites(userId: string): Promise<Favorite[]> {
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Favorite));
}

export async function isFavorite(userId: string, promptId: string): Promise<boolean> {
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", userId),
    where("promptId", "==", promptId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function toggleFavorite(userId: string, promptId: string): Promise<boolean> {
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", userId),
    where("promptId", "==", promptId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(doc(db, "favorites", snap.docs[0].id));
    return false; // Removed
  } else {
    const favoriteId = `${userId}_${promptId}`;
    await setDoc(doc(db, "favorites", favoriteId), {
      userId,
      promptId,
      createdAt: serverTimestamp(),
    });
    return true; // Added
  }
}

// --- REVIEWS ---
export async function getReviewsForPrompt(promptId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("promptId", "==", promptId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}

export async function addReview(
  userId: string,
  userName: string,
  userAvatar: string,
  promptId: string,
  rating: number,
  reviewText: string
): Promise<Review> {
  const reviewData = {
    userId,
    userName,
    userAvatar,
    promptId,
    rating,
    review: reviewText,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "reviews"), reviewData);
  return { id: docRef.id, ...reviewData } as unknown as Review;
}

// --- SUPPORT TICKETS ---
export async function getSupportTickets(userId: string): Promise<SupportTicket[]> {
  const q = query(
    collection(db, "supportTickets"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupportTicket));
}

export async function createSupportTicket(
  userId: string,
  userEmail: string,
  userName: string,
  subject: string,
  message: string
): Promise<SupportTicket> {
  const ticketData = {
    userId,
    userEmail,
    userName,
    subject,
    message,
    status: "open" as const,
    messages: [
      {
        sender: "user" as const,
        message,
        createdAt: new Date(),
      },
    ],
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "supportTickets"), ticketData);
  return { id: docRef.id, ...ticketData } as unknown as SupportTicket;
}

export async function addMessageToTicket(
  ticketId: string,
  sender: "user" | "admin",
  message: string
): Promise<void> {
  const ticketRef = doc(db, "supportTickets", ticketId);
  const newMessage = {
    sender,
    message,
    createdAt: new Date(),
  };
  await updateDoc(ticketRef, {
    messages: arrayUnion(newMessage),
    status: sender === "admin" ? "replied" : "open",
  });
}
