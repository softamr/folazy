import type { Listing, User, Category } from './types';

export const placeholderUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2023-01-15' },
  { id: 'user2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png', joinDate: '2022-11-20' },
  { id: 'user3', name: 'Charlie Brown', joinDate: '2023-05-10' },
];

export const placeholderCategories: Category[] = [
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Furniture' },
  { id: 'cat3', name: 'Vehicles' },
  { id: 'cat4', name: 'Clothing & Accessories' },
  { id: 'cat5', name: 'Home & Garden' },
  { id: 'cat6', name: 'Books & Media' },
];

export const placeholderListings: Listing[] = [
  {
    id: 'listing1',
    title: 'Vintage Leather Sofa',
    description: 'A beautiful vintage leather sofa, in excellent condition. Perfect for a cozy living room. Minor wear consistent with age.',
    price: 450,
    category: placeholderCategories[1],
    location: 'New York, NY',
    images: ['https://placehold.co/600x400.png?text=Sofa+1', 'https://placehold.co/600x400.png?text=Sofa+2', 'https://placehold.co/600x400.png?text=Sofa+3'],
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
    images: ['https://placehold.co/600x400.png?text=Phone+1', 'https://placehold.co/600x400.png?text=Phone+2'],
    seller: placeholderUsers[1],
    postedDate: '2024-07-15',
  },
  {
    id: 'listing3',
    title: 'Mountain Bike - XL Frame',
    description: 'Durable mountain bike with an XL frame, suitable for taller riders. Recently serviced and ready for trails.',
    price: 300,
    category: placeholderCategories[2], // Assuming 'Vehicles' can include bikes
    location: 'Denver, CO',
    images: ['https://placehold.co/600x400.png?text=Bike+1'],
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
    images: ['https://placehold.co/600x400.png?text=Bag+1', 'https://placehold.co/600x400.png?text=Bag+2'],
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
    images: ['https://placehold.co/600x400.png?text=Bookshelf+1'],
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
    images: ['https://placehold.co/600x400.png?text=Laptop+1', 'https://placehold.co/600x400.png?text=Laptop+2', 'https://placehold.co/600x400.png?text=Laptop+3'],
    seller: placeholderUsers[0],
    postedDate: '2024-07-20',
  },
];
