import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  joinDate: string;
};

export type Category = {
  id: string;
  name: string;
  icon?: LucideIcon; // Optional icon for main categories
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  location: string;
  images: string[]; // URLs of images
  seller: User;
  postedDate: string;
  isFeatured?: boolean;
};

export type ImageAnalysisResult = {
  isAuthentic: boolean;
  issues: string[];
};

export type PopularCategoryLink = {
  name: string;
  href: string;
};

export type PopularCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  subLinks: PopularCategoryLink[];
  allLink: PopularCategoryLink;
};
