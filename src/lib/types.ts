export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  joinDate: string;
};

export type Category = {
  id: string;
  name: string;
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
