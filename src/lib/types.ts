
import type React from 'react';
import type { LucideIcon as LucideIconType } from 'lucide-react'; // Keep for other uses if any, or for mapping

export type User = {
  id: string; // This will be the uid from Firebase Auth
  name: string;
  email: string; // Added email field
  phone?: string; // Added optional phone field
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
  order?: number; // For reordering main categories
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

// --- START NEW LOCATION TYPES ---
export interface LocationRef { // For storing on the listing or referencing
  id: string;
  name: string;
}

export interface LocationDistrict extends LocationRef {
  // any district-specific fields if needed in future
}

export interface LocationGovernorate extends LocationRef {
  districts?: LocationDistrict[];
}

export interface LocationCountry extends LocationRef {
  governorates?: LocationGovernorate[];
}
// --- END NEW LOCATION TYPES ---

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategoryInfo; // Use simplified type for stored category
  subcategory?: ListingCategoryInfo; // Use simplified type for stored subcategory
  
  location: string; // This will be deprecated or hold a display string.
  // New structured location fields:
  locationCountry?: LocationRef;
  locationGovernorate?: LocationRef;
  locationDistrict?: LocationRef;

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


// For chat system
export type Message = {
  id: string; // Firestore document ID
  conversationId: string; 
  senderId: string;
  receiverId: string; 
  text: string;
  timestamp: string; // ISO string, store as Firestore Timestamp
  isRead: boolean;
};

export type Conversation = {
  id: string; // Firestore document ID
  listingId?: string;
  listing?: { // Store basic listing info for quick display
    id: string;
    title: string;
    imageUrl?: string; // First image of the listing
  };
  participantIds: string[]; // [userId1, userId2] - sorted for querying
  participants: { // Store basic info for quick display
    [userId: string]: {
      id: string;
      name: string;
      avatarUrl?: string;
    }
  };
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: string; // ISO string, store as Firestore Timestamp
  };
  // lastUpdatedAt: string; // ISO string, store as Firestore Timestamp. Can use lastMessage.timestamp
};

// For dynamic icon mapping
export type IconMapping = {
    [key: string]: LucideIconType;
};

export type HeroBannerImage = {
  id: string; // Unique ID for the image (e.g., Firestore auto-ID or timestamp-based)
  src: string; // URL of the image in Firebase Storage
  alt: string; // Alt text for accessibility
  uploadedAt?: string; // ISO string timestamp
  // dataAiHint?: string; // Optional AI hint if admins provide it
};
