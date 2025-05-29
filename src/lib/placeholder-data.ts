import type { Listing, User, Category, PopularCategory, Conversation, Message, ListingStatus } from './types';
import { Car, Building2, Smartphone, Briefcase, Laptop, Sofa, GripVertical, Baby, Puzzle, Shirt, Dog, Factory, UsersIcon, Sparkles, HomeIcon, Tv, Lamp, ShoppingBag, Settings2, MoreHorizontal, MessageSquare, ListChecks, UserCircleIcon, ShieldCheck } from 'lucide-react';

export const placeholderUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2023-01-15', isAdmin: true }, // Alice is now an admin
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2022-11-20' },
  { id: 'user3', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2023-05-10' },
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
  { id: 'more_categories', name: 'More', icon: MoreHorizontal, href: '/s/all-categories' } // This could link to a page showing all categories
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
    id: 'pop_mobiles_tablets', // This should map to electronics/mobiles or electronics/tablets
    name: 'Mobiles & Tablets',
    icon: Smartphone,
    href: '/s/electronics/mobiles', // Main link for the card
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
  {
    id: 'listing1',
    title: 'Vintage Leather Sofa',
    description: 'A beautiful vintage leather sofa, in excellent condition. Perfect for a cozy living room. Minor wear consistent with age.',
    price: 450,
    category: placeholderCategories.find(c => c.id === 'furniture')!,
    subcategory: placeholderCategories.find(c => c.id === 'furniture')?.subcategories?.find(sc => sc.id === 'living-room'),
    location: 'New York, NY',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-10',
    isFeatured: true,
    status: 'approved',
  },
  {
    id: 'listing2',
    title: 'Smartphone XYZ - Like New',
    description: 'Latest model Smartphone XYZ, used for only 2 months. Comes with original box and accessories. No scratches or dents.',
    price: 700,
    category: placeholderCategories.find(c => c.id === 'electronics')!,
    subcategory: placeholderCategories.find(c => c.id === 'electronics')?.subcategories?.find(sc => sc.id === 'mobiles'),
    location: 'San Francisco, CA',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[1],
    postedDate: '2024-07-15',
    status: 'approved',
  },
  {
    id: 'listing3',
    title: 'Mountain Bike - XL Frame',
    description: 'Durable mountain bike with an XL frame, suitable for taller riders. Recently serviced and ready for trails.',
    price: 300,
    category: placeholderCategories.find(c => c.id === 'hobbies')!, // Assuming hobbies includes bikes
    location: 'Denver, CO',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-18',
    status: 'pending',
  },
  {
    id: 'listing4',
    title: 'Designer Handbag',
    description: 'Authentic designer handbag, rarely used. Classic style, comes with dust bag. A statement piece for any wardrobe.',
    price: 250,
    category: placeholderCategories.find(c => c.id === 'fashion')!,
    location: 'Los Angeles, CA',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[2],
    postedDate: '2024-07-05',
    isFeatured: true,
    status: 'approved',
  },
  {
    id: 'listing5',
    title: 'Antique Wooden Bookshelf',
    description: 'Solid oak bookshelf with intricate carvings. A truly unique piece for book lovers. Adds character to any room.',
    price: 180,
    category: placeholderCategories.find(c => c.id === 'furniture')!,
    subcategory: placeholderCategories.find(c => c.id === 'furniture')?.subcategories?.find(sc => sc.id === 'decor'),
    location: 'Boston, MA',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[1],
    postedDate: '2024-07-12',
    status: 'rejected',
  },
  {
    id: 'listing6',
    title: 'Gaming Laptop - High Performance',
    description: 'Powerful gaming laptop with top-tier specs. Capable of running all modern games at high settings. Includes cooling pad.',
    price: 1200,
    category: placeholderCategories.find(c => c.id === 'electronics')!,
    subcategory: placeholderCategories.find(c => c.id === 'electronics')?.subcategories?.find(sc => sc.id === 'laptops'),
    location: 'Austin, TX',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-20',
    status: 'approved',
  },
  {
    id: 'listing7',
    title: 'Apartment for Rent - Downtown',
    description: 'Spacious 2-bedroom apartment in the heart of downtown. Modern amenities, close to public transport.',
    price: 2200,
    category: placeholderCategories.find(c => c.id === 'properties')!,
    subcategory: placeholderCategories.find(c => c.id === 'properties')?.subcategories?.find(sc => sc.id === 'apartments-for-rent'),
    location: 'Chicago, IL',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    seller: placeholderUsers[1],
    postedDate: '2024-07-22',
    isFeatured: true,
    status: 'pending',
  },
  {
    id: 'listing8',
    title: 'Ford Focus 2018 - Low Mileage',
    description: 'Well-maintained Ford Focus, 2018 model. Low mileage, clean title. Great fuel efficiency.',
    price: 12500,
    category: placeholderCategories.find(c => c.id === 'vehicles')!,
    subcategory: placeholderCategories.find(c => c.id === 'vehicles')?.subcategories?.find(sc => sc.id === 'cars-for-sale'),
    location: 'Miami, FL',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    seller: placeholderUsers[2],
    postedDate: '2024-07-19',
    status: 'approved',
  },
];

// Placeholder Chat Data
const mockMessage1: Message = {
  id: 'msg1',
  conversationId: 'convo1',
  senderId: 'user2',
  receiverId: 'user1',
  text: 'Hi Alice, is the Vintage Leather Sofa still available?',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  isRead: false,
};

const mockMessage2: Message = {
  id: 'msg2',
  conversationId: 'convo1',
  senderId: 'user1',
  receiverId: 'user2',
  text: 'Hello Bob! Yes, it is. Are you interested?',
  timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55 mins ago
  isRead: true,
};

const mockMessage3: Message = {
  id: 'msg3',
  conversationId: 'convo2',
  senderId: 'user3',
  receiverId: 'user1',
  text: 'About the Gaming Laptop, can you do $1100?',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  isRead: true,
};


export const placeholderConversations: Conversation[] = [
  {
    id: 'convo1',
    listingId: 'listing1',
    listingTitle: 'Vintage Leather Sofa',
    participants: [placeholderUsers.find(u => u.id === 'user1')!, placeholderUsers.find(u => u.id === 'user2')!],
    lastMessage: mockMessage2,
    unreadCount: 0,
  },
  {
    id: 'convo2',
    listingId: 'listing6',
    listingTitle: 'Gaming Laptop - High Performance',
    participants: [placeholderUsers.find(u => u.id === 'user1')!, placeholderUsers.find(u => u.id === 'user3')!],
    lastMessage: mockMessage3,
    unreadCount: 1,
  },
];

export const placeholderMessagesForConversation: Record<string, Message[]> = {
  'convo1': [mockMessage1, mockMessage2],
  'convo2': [mockMessage3],
};
