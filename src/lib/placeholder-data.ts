import type { Listing, User, Category, PopularCategory, Conversation, Message, ListingStatus } from './types';
import { Car, Building2, Smartphone, Briefcase, Laptop, Sofa, GripVertical, Baby, Puzzle, Shirt, Dog, Factory, UsersIcon, Sparkles, HomeIcon, Tv, Lamp, ShoppingBag, Settings2, MoreHorizontal, MessageSquare, ListChecks, UserCircleIcon, ShieldCheck } from 'lucide-react';

export const placeholderUsers: User[] = [
  // Users removed to start with real data
];

export const placeholderCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: Laptop,
    subcategories: [
      { id: 'mobiles', name: 'Mobile Phones', href: '/s/electronics/mobiles' },
      { id: 'tablets', name: 'Tablets', href: '/s/electronics/tablets' },
      { id: 'laptops', name: 'Laptops & Computers', href: '/s/electronics/laptops' },
      { id: 'tvs', name: 'TVs & Audio', href: '/s/electronics/tvs' },
      { id: 'cameras', name: 'Cameras & Imaging', href: '/s/electronics/cameras' },
    ],
    href: '/s/electronics',
  },
  {
    id: 'furniture',
    name: 'Furniture & Decor',
    icon: Sofa,
    subcategories: [
      { id: 'living-room', name: 'Living Room', href: '/s/furniture/living-room' },
      { id: 'bedroom', name: 'Bedroom', href: '/s/furniture/bedroom' },
      { id: 'office', name: 'Office Furniture', href: '/s/furniture/office' },
      { id: 'decor', name: 'Home Decor', href: '/s/furniture/decor' },
    ],
    href: '/s/furniture',
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: Car,
    subcategories: [
      { id: 'cars-for-sale', name: 'Cars for Sale', href: '/s/vehicles/cars-for-sale' },
      { id: 'cars-for-rent', name: 'Cars for Rent', href: '/s/vehicles/cars-for-rent' },
      { id: 'motorcycles', name: 'Motorcycles', href: '/s/vehicles/motorcycles' },
      { id: 'auto-parts', name: 'Auto Parts & Accessories', href: '/s/vehicles/auto-parts' },
    ],
    href: '/s/vehicles',
  },
  {
    id: 'properties',
    name: 'Properties',
    icon: Building2,
    subcategories: [
      { id: 'apartments-for-sale', name: 'Apartments for Sale', href: '/s/properties/apartments-for-sale' },
      { id: 'apartments-for-rent', name: 'Apartments for Rent', href: '/s/properties/apartments-for-rent' },
      { id: 'villas-for-sale', name: 'Villas for Sale', href: '/s/properties/villas-for-sale' },
      { id: 'commercial-for-rent', name: 'Commercial for Rent', href: '/s/properties/commercial-for-rent' },
    ],
    href: '/s/properties',
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: Briefcase,
    subcategories: [
      { id: 'accounting', name: 'Accounting & Finance', href: '/s/jobs/accounting' },
      { id: 'engineering', name: 'Engineering', href: '/s/jobs/engineering' },
      { id: 'sales', name: 'Sales & Marketing', href: '/s/jobs/sales' },
      { id: 'it', name: 'IT & Software', href: '/s/jobs/it' },
    ],
    href: '/s/jobs',
  },
  { id: 'fashion', name: 'Fashion & Beauty', icon: Shirt, href: '/s/fashion' },
  { id: 'pets', name: 'Pets', icon: Dog, href: '/s/pets' },
  { id: 'kids', name: 'Kids & Babies', icon: Baby, href: '/s/kids' },
  { id: 'hobbies', name: 'Hobbies, Sports & Outdoors', icon: Puzzle, href: '/s/hobbies' },
  { id: 'industrial', name: 'Business & Industrial', icon: Factory, href: '/s/industrial' },
  { id: 'services', name: 'Services', icon: Settings2, href: '/s/services' },
];

export const mainSiteCategories: Category[] = [
  placeholderCategories.find(cat => cat.id === 'vehicles')!,
  placeholderCategories.find(cat => cat.id === 'properties')!,
];

export const secondaryNavCategories: Category[] = [
  placeholderCategories.find(cat => cat.id === 'electronics')!,
  placeholderCategories.find(cat => cat.id === 'jobs')!,
  placeholderCategories.find(cat => cat.id === 'furniture')!,
  placeholderCategories.find(cat => cat.id === 'fashion')!,
  placeholderCategories.find(cat => cat.id === 'pets')!,
  placeholderCategories.find(cat => cat.id === 'kids')!,
  { id: 'more_categories', name: 'More', icon: MoreHorizontal, href: '/s/all-categories' } 
];


export const popularCategoryData: PopularCategory[] = [
  {
    id: 'pop_vehicles',
    name: 'Vehicles',
    icon: Car,
    href: '/s/vehicles',
    subLinks: placeholderCategories.find(c => c.id === 'vehicles')?.subcategories?.slice(0, 2).map(sc => ({ name: sc.name, href: sc.href || '#', isSubcategory: true })) || [],
  },
  {
    id: 'pop_properties',
    name: 'Properties',
    icon: Building2,
    href: '/s/properties',
    subLinks: placeholderCategories.find(c => c.id === 'properties')?.subcategories?.slice(0, 2).map(sc => ({ name: sc.name, href: sc.href || '#', isSubcategory: true })) || [],
  },
  {
    id: 'pop_mobiles_tablets', 
    name: 'Mobiles & Tablets',
    icon: Smartphone,
    href: '/s/electronics/mobiles', 
    subLinks: [
      { name: 'Mobile Phones', href: '/s/electronics/mobiles', isSubcategory: true },
      { name: 'Tablets', href: '/s/electronics/tablets', isSubcategory: true },
    ],
  },
  {
    id: 'pop_jobs',
    name: 'Jobs',
    icon: Briefcase,
    href: '/s/jobs',
    subLinks: placeholderCategories.find(c => c.id === 'jobs')?.subcategories?.slice(0, 2).map(sc => ({ name: sc.name, href: sc.href || '#', isSubcategory: true })) || [],
  },
  {
    id: 'pop_electronics',
    name: 'Electronics & Appliances',
    icon: Laptop,
    href: '/s/electronics',
    subLinks: placeholderCategories.find(c => c.id === 'electronics')?.subcategories?.slice(0, 2).map(sc => ({ name: sc.name, href: sc.href || '#', isSubcategory: true })) || [],
  },
  {
    id: 'pop_furniture',
    name: 'Furniture & Decor',
    icon: Sofa,
    href: '/s/furniture',
    subLinks: placeholderCategories.find(c => c.id === 'furniture')?.subcategories?.slice(0, 2).map(sc => ({ name: sc.name, href: sc.href || '#', isSubcategory: true })) || [],
  },
  {
    id: 'pop_fashion_beauty',
    name: 'Fashion & Beauty',
    icon: Shirt,
    href: '/s/fashion',
    subLinks: [
      { name: 'Women\'s Clothing', href: '/s/fashion/womens-clothing', isSubcategory: true },
      { name: 'Men\'s Clothing', href: '/s/fashion/mens-clothing', isSubcategory: true },
    ],
  },
  {
    id: 'pop_pets',
    name: 'Pets',
    icon: Dog,
    href: '/s/pets',
    subLinks: [
      { name: 'Birds - Pigeons', href: '/s/pets/birds', isSubcategory: true },
      { name: 'Cats', href: '/s/pets/cats', isSubcategory: true },
    ],
  },
   {
    id: 'pop_kids_babies',
    name: 'Kids & Babies',
    icon: Baby,
    href: '/s/kids',
    subLinks: [
      { name: 'Baby & Mom Healthcare', href: '/s/kids/healthcare', isSubcategory: true },
      { name: 'Baby Clothing', href: '/s/kids/clothing', isSubcategory: true },
    ],
  },
  {
    id: 'pop_hobbies',
    name: 'Hobbies',
    icon: Puzzle,
    href: '/s/hobbies',
    subLinks: [
      { name: 'Antiques - Collectibles', href: '/s/hobbies/antiques', isSubcategory: true },
      { name: 'Bicycles', href: '/s/hobbies/bicycles', isSubcategory: true },
    ],
  },
  {
    id: 'pop_business_industrial',
    name: 'Businesses & Industrial',
    icon: Factory,
    href: '/s/industrial',
     subLinks: [
      { name: 'Agriculture', href: '/s/industrial/agriculture', isSubcategory: true },
      { name: 'Construction', href: '/s/industrial/construction', isSubcategory: true },
    ],
  },
  {
    id: 'pop_services',
    name: 'Services',
    icon: Settings2,
    href: '/s/services',
    subLinks: [
      { name: 'Business Services', href: '/s/services/business', isSubcategory: true },
      { name: 'Car Services', href: '/s/services/car-services', isSubcategory: true },
    ],
  },
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
