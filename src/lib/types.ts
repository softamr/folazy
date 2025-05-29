
import type React from 'react';
import type { LucideIcon as LucideIconType } from 'lucide-react'; // Keep for other uses if any, or for mapping

export type User = {
  id: string; // This will be the uid from Firebase Auth
  name: string;
  email: string; // Added email field
  avatarUrl?: string;
  joinDate: string;
  isAdmin?: boolean;
};

// Represents a category or subcategory structure as stored in Firestore
// and used throughout the app.
export interface Category {
  id: string; // Firestore document ID for main categories, or a generated ID/slug for subcategories
  name: string;
  iconName?: string; // Name of the Lucide icon (e.g., "Car", "Laptop")
  subcategories?: Category[]; // Array of subcategory objects. Subcategories here won't have their own 'subcategories' array.
  href?: string; // Optional: if we want to override default /s/:id route
}

// Simplified category information to be stored within a Listing document
export type ListingCategoryInfo = {
  id: string;
  name: string;
  // Does not include iconName or subcategories array for listings
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

// This type will be less used if PopularCategories fetches directly from Firestore
export type PopularCategory = {
  id: string;
  name: string;
  icon: LucideIconType; // This was the old type, will be replaced by iconName logic
  iconName?: string; // For dynamic fetching
  href: string;
  subLinks: PopularCategoryLink[];
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

// For dynamic icon mapping
export type IconMapping = {
    [key: string]: LucideIconType;
};
