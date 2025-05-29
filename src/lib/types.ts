
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string; // This will be the uid from Firebase Auth
  name: string;
  email: string; // Added email field
  avatarUrl?: string;
  joinDate: string;
  isAdmin?: boolean;
};

export interface Category {
  id: string;
  name: string;
  icon?: LucideIcon; // Optional icon for main categories
  subcategories?: Category[]; // For subcategories
  href?: string; // For linking directly, e.g. in PopularCategories
}

// Simplified category information to be stored within a Listing document
export type ListingCategoryInfo = {
  id: string;
  name: string;
  // Does not include icon, href, or subcategories array
};

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'sold'; // Added 'sold'

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategoryInfo; // Use simplified type for stored category
  subcategory?: ListingCategoryInfo; // Use simplified type for stored subcategory
  location: string;
  images: string[]; // URLs of images
  seller: User;
  postedDate: string;
  isFeatured?: boolean;
  status: ListingStatus; // Added for ad approval
};

export type ImageAnalysisResult = {
  isAuthentic: boolean;
  issues: string[];
};

export type PopularCategoryLink = {
  name: string;
  href: string;
  isSubcategory?: boolean; // To differentiate styling or behavior if needed
};

export type PopularCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string; // Link for the main popular category (e.g., "All in Vehicles")
  subLinks: PopularCategoryLink[]; // Can now represent direct subcategories or featured links
};

// For chat system placeholder
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  listingId?: string;
  listingTitle?: string;
  participants: [User, User]; // [UserA, UserB]
  lastMessage: Message;
  unreadCount: number;
};
