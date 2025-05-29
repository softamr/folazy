import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  joinDate: string;
  isAdmin?: boolean; // Added for admin role
};

export interface Category {
  id: string;
  name: string;
  icon?: LucideIcon; // Optional icon for main categories
  subcategories?: Category[]; // For subcategories
  href?: string; // For linking directly, e.g. in PopularCategories
}

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'sold'; // Added 'sold'

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category; // Main category
  subcategory?: Category; // Optional subcategory
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
