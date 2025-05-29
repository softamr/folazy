
import type { Listing, User, Category, PopularCategory, Conversation, Message, ListingStatus } from './types';
// Icons are now dynamically imported in components based on iconName string
// import { Car, Building2, Smartphone, Briefcase, Laptop, Sofa, GripVertical, Baby, Puzzle, Shirt, Dog, Factory, UsersIcon, Sparkles, HomeIcon, Tv, Lamp, ShoppingBag, Settings2, MoreHorizontal, MessageSquare, ListChecks, UserCircleIcon, ShieldCheck } from 'lucide-react';

export const placeholderUsers: User[] = [
  // Users removed to start with real data
];

// placeholderCategories is now effectively deprecated as categories are fetched from Firestore.
// It can be removed or kept for reference during development if needed, but components should not rely on it.
export const placeholderCategories_DEPRECATED: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    iconName: 'Laptop', // Changed from icon: Laptop
    subcategories: [
      { id: 'mobiles', name: 'Mobile Phones', iconName: 'Smartphone', href: '/s/electronics/mobiles' },
      { id: 'tablets', name: 'Tablets', iconName: 'Tablet', href: '/s/electronics/tablets' },
    ],
    href: '/s/electronics',
  },
  // ... other categories converted similarly or removed
];

// These are now dynamically determined in Header.tsx from Firestore data
export const mainSiteCategories_DEPRECATED: Category[] = [
  // placeholderCategories_DEPRECATED.find(cat => cat.id === 'vehicles')!,
  // placeholderCategories_DEPRECATED.find(cat => cat.id === 'properties')!,
];

export const secondaryNavCategories_DEPRECATED: Category[] = [
  // placeholderCategories_DEPRECATED.find(cat => cat.id === 'electronics')!,
  // ...
  // { id: 'more_categories', name: 'More', iconName: 'MoreHorizontal', href: '/s/all-categories' } 
];


// popularCategoryData is now replaced by dynamic fetching in PopularCategories.tsx
export const popularCategoryData_DEPRECATED: PopularCategory[] = [
  // Example structure (if it were still used)
  // {
  //   id: 'pop_vehicles',
  //   name: 'Vehicles',
  //   iconName: 'Car', // Changed from icon
  //   href: '/s/vehicles',
  //   subLinks: placeholderCategories_DEPRECATED.find(c => c.id === 'vehicles')?.subcategories?.slice(0, 2).map(sc => ({ name: sc.name, href: sc.href || '#', isSubcategory: true })) || [],
  // },
  // ... other popular categories converted or removed
];

export const placeholderListings: Listing[] = [
  // Listings removed to start with real data
];

export const placeholderConversations: Conversation[] = [
  // Conversations removed to start with real data
];

export const placeholderMessagesForConversation: Record<string, Message[]> = {
  // Messages removed to start with real data
};
