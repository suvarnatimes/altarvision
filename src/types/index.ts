export interface User {
  id: string; // Firestore doc ID
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'customer';
  createdAt: any; // Firestore Timestamp
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: any;
}

export interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  thumbnail: string;
  previewImages: string[];
  promptContent: string; // SECURE: Only exposed to purchasers
  tags: string[];
  price: number;
  featured: boolean;
  status: 'draft' | 'published';
  createdAt: any;
  updatedAt: any;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  prompts: string[]; // Array of prompt IDs
  createdAt: any;
}

export interface PurchasedItem {
  id: string; // promptId or bundleId
  type: 'prompt' | 'bundle';
  title: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  amount: number; // In Rupees (store as float/integer)
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  purchasedItems: PurchasedItem[];
  couponUsed?: string;
  createdAt: any;
}

export interface Download {
  id: string;
  userId: string;
  promptId: string;
  downloadedAt: any;
}

export interface Favorite {
  id: string;
  userId: string;
  promptId: string;
  createdAt: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  promptId: string;
  rating: number; // 1-5
  review: string;
  createdAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  expiryDate: string; // YYYY-MM-DD
  active: boolean;
}

export interface TicketMessage {
  sender: 'user' | 'admin';
  message: string;
  createdAt: any;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'replied' | 'closed';
  messages: TicketMessage[];
  createdAt: any;
}

export interface AnalyticsEvent {
  id: string;
  event: string; // 'view_prompt' | 'download_prompt' | 'add_wishlist' | 'checkout_success'
  userId?: string;
  metadata: Record<string, any>;
  createdAt: any;
}
