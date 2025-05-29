import type { Listing, User, Category, PopularCategory } from './types';
import { Car, Building2, Smartphone, Briefcase, Laptop, Sofa, GripVertical, Baby, Puzzle, Shirt, Dog, Factory, UsersIcon, Sparkles, HomeIcon, Tv, Lamp, ShoppingBag, Settings2, MoreHorizontal } from 'lucide-react'; // Added MoreHorizontal

export const placeholderUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2023-01-15' },
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2022-11-20' },
  { id: 'user3', name: 'Charlie Brown', joinDate: '2023-05-10' },
];

export const mainSiteCategories: Category[] = [
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'properties', name: 'Properties', icon: Building2 },
  { id: 'mobiles_tablets', name: 'Mobiles & Tablets', icon: Smartphone },
  { id: 'jobs', name: 'Jobs', icon: Briefcase },
  { id: 'electronics_appliances', name: 'Electronics & Appliances', icon: Laptop },
  { id: 'furniture_decor', name: 'Furniture & Decor', icon: Sofa },
  { id: 'more_categories', name: 'More Categories', icon: MoreHorizontal }, // Changed icon
];


export const placeholderCategories: Category[] = [
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Furniture' },
  { id: 'cat3', name: 'Vehicles' },
  { id: 'cat4', name: 'Clothing & Accessories' },
  { id: 'cat5', name: 'Home & Garden' },
  { id: 'cat6', name: 'Books & Media' },
  { id: 'cat7', name: 'Jobs' },
  { id: 'cat8', name: 'Pets' },
  { id: 'cat9', name: 'Kids & Babies' },
  { id: 'cat10', name: 'Hobbies' },
  { id: 'cat11', name: 'Businesses & Industrial' },
  { id: 'cat12', name: 'Services' },
];


export const popularCategoryData: PopularCategory[] = [
  {
    id: 'pop_vehicles',
    name: 'Vehicles',
    icon: Car,
    subLinks: [
      { name: 'Cars for Sale', href: '/s/vehicles/cars-for-sale' },
      { name: 'Cars for Rent', href: '/s/vehicles/cars-for-rent' },
    ],
    allLink: { name: 'All In Vehicles', href: '/s/vehicles' },
  },
  {
    id: 'pop_properties',
    name: 'Properties',
    icon: Building2,
    subLinks: [
      { name: 'Apartments for Sale', href: '/s/properties/apartments-for-sale' },
      { name: 'Apartments for Rent', href: '/s/properties/apartments-for-rent' },
    ],
    allLink: { name: 'All In Properties', href: '/s/properties' },
  },
  {
    id: 'pop_mobiles_tablets',
    name: 'Mobiles & Tablets',
    icon: Smartphone,
    subLinks: [
      { name: 'Mobile Phones', href: '/s/mobiles-tablets/mobile-phones' },
      { name: 'Tablets', href: '/s/mobiles-tablets/tablets' },
    ],
    allLink: { name: 'All In Mobiles & Tablets', href: '/s/mobiles-tablets' },
  },
  {
    id: 'pop_jobs',
    name: 'Jobs',
    icon: Briefcase,
    subLinks: [
      { name: 'Accounting, Finance & Banking', href: '/s/jobs/accounting' },
      { name: 'Engineering', href: '/s/jobs/engineering' },
    ],
    allLink: { name: 'All In Jobs', href: '/s/jobs' },
  },
  {
    id: 'pop_electronics',
    name: 'Electronics & Appliances',
    icon: Laptop,
    subLinks: [
      { name: 'TV - Audio - Video', href: '/s/electronics/tv-audio-video' },
      { name: 'Computers - Accessories', href: '/s/electronics/computers' },
    ],
    allLink: { name: 'All In Electronics & Appliances', href: '/s/electronics' },
  },
  {
    id: 'pop_furniture',
    name: 'Furniture & Decor',
    icon: Sofa,
    subLinks: [
      { name: 'Bathroom', href: '/s/furniture/bathroom' },
      { name: 'Bedroom', href: '/s/furniture/bedroom' },
    ],
    allLink: { name: 'All In Furniture & Decor', href: '/s/furniture' },
  },
  {
    id: 'pop_fashion_beauty',
    name: 'Fashion & Beauty',
    icon: Shirt, // Using Shirt as a general fashion icon
    subLinks: [
      { name: 'Women\'s Clothing', href: '/s/fashion/womens-clothing' },
      { name: 'Men\'s Clothing', href: '/s/fashion/mens-clothing' },
    ],
    allLink: { name: 'All In Fashion & Beauty', href: '/s/fashion' },
  },
  {
    id: 'pop_pets',
    name: 'Pets',
    icon: Dog, // Using Dog as a general pet icon
    subLinks: [
      { name: 'Birds - Pigeons', href: '/s/pets/birds' },
      { name: 'Cats', href: '/s/pets/cats' },
    ],
    allLink: { name: 'All In Pets', href: '/s/pets' },
  },
   {
    id: 'pop_kids_babies',
    name: 'Kids & Babies',
    icon: Baby,
    subLinks: [
      { name: 'Baby & Mom Healthcare', href: '/s/kids-babies/healthcare' },
      { name: 'Baby Clothing', href: '/s/kids-babies/clothing' },
    ],
    allLink: { name: 'All In Kids & Babies', href: '/s/kids-babies' },
  },
  {
    id: 'pop_hobbies',
    name: 'Hobbies',
    icon: Puzzle, // Using Puzzle as a general hobbies icon
    subLinks: [
      { name: 'Antiques - Collectibles', href: '/s/hobbies/antiques' },
      { name: 'Bicycles', href: '/s/hobbies/bicycles' },
    ],
    allLink: { name: 'All In Hobbies', href: '/s/hobbies' },
  },
  {
    id: 'pop_business_industrial',
    name: 'Businesses & Industrial',
    icon: Factory,
    subLinks: [
      { name: 'Agriculture', href: '/s/business/agriculture' },
      { name: 'Construction', href: '/s/business/construction' },
    ],
    allLink: { name: 'All In Businesses & Industrial', href: '/s/business' },
  },
  {
    id: 'pop_services',
    name: 'Services',
    icon: Settings2, // Using Settings2 as a general services icon
    subLinks: [
      { name: 'Business', href: '/s/services/business' },
      { name: 'Car', href: '/s/services/car' }, // Assuming this means car services
    ],
    allLink: { name: 'All In Services', href: '/s/services' },
  },
];


export const placeholderListings: Listing[] = [
  {
    id: 'listing1',
    title: 'Vintage Leather Sofa',
    description: 'A beautiful vintage leather sofa, in excellent condition. Perfect for a cozy living room. Minor wear consistent with age.',
    price: 450,
    category: placeholderCategories[1],
    location: 'New York, NY',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-10',
    isFeatured: true,
  },
  {
    id: 'listing2',
    title: 'Smartphone XYZ - Like New',
    description: 'Latest model Smartphone XYZ, used for only 2 months. Comes with original box and accessories. No scratches or dents.',
    price: 700,
    category: placeholderCategories[0],
    location: 'San Francisco, CA',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[1],
    postedDate: '2024-07-15',
  },
  {
    id: 'listing3',
    title: 'Mountain Bike - XL Frame',
    description: 'Durable mountain bike with an XL frame, suitable for taller riders. Recently serviced and ready for trails.',
    price: 300,
    category: placeholderCategories[2],
    location: 'Denver, CO',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-18',
  },
  {
    id: 'listing4',
    title: 'Designer Handbag',
    description: 'Authentic designer handbag, rarely used. Classic style, comes with dust bag. A statement piece for any wardrobe.',
    price: 250,
    category: placeholderCategories[3],
    location: 'Los Angeles, CA',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[2],
    postedDate: '2024-07-05',
    isFeatured: true,
  },
  {
    id: 'listing5',
    title: 'Antique Wooden Bookshelf',
    description: 'Solid oak bookshelf with intricate carvings. A truly unique piece for book lovers. Adds character to any room.',
    price: 180,
    category: placeholderCategories[1],
    location: 'Boston, MA',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[1],
    postedDate: '2024-07-12',
  },
  {
    id: 'listing6',
    title: 'Gaming Laptop - High Performance',
    description: 'Powerful gaming laptop with top-tier specs. Capable of running all modern games at high settings. Includes cooling pad.',
    price: 1200,
    category: placeholderCategories[0],
    location: 'Austin, TX',
    images: ['https://placehold.co/600x400.png'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-20',
  },
];
