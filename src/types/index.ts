export type VideoPlatform = 'instagram' | 'tiktok' | 'youtube' | 'xiaohongshu' | 'other';

export interface ShortVideoSource {
  id: string;
  platform: VideoPlatform;
  url: string;
  creatorName?: string;
  title?: string;
  thumbnailUrl?: string;
  highlights?: string[];
}

export type RestaurantRatingTag = 
  | 'must_eat'       // 🔥 超推必吃
  | 'frequent_visit'  // 🔄 常去回訪
  | 'avoid_again'    // ❌ 不會再吃第二次
  | 'mediocre'       // 😐 普通吃過即可
  | 'wishlist';      // 📌 待吃口袋名單

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  favoriteTags: string[];
  dislikedTags: string[];
  notes?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  googleMapsUrl?: string;
  googleRating?: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  ratingTag: RestaurantRatingTag;
  visitCount: number;
  lastVisitedDate?: string; // YYYY-MM-DD
  mustEatDishes: string[];
  avoidDishes: string[];
  personalNotes: string;
  videos: ShortVideoSource[];
  recommendedByFriendIds?: string[];
  dinedWithFriendIds?: string[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  defaultCity: string;
  instagramHandle?: string;
  favoriteTags: string[];
  dislikedTags: string[];
  spicinessLevel: 'none' | 'mild' | 'medium' | 'hot' | 'insane';
  budgetPreference: '$' | '$$' | '$$$' | '$$$$';
  favoriteDrink?: string;
}

export type ActiveTab = 'map' | 'list' | 'friends' | 'matcher';

export type SortOption = 'distance' | 'rating' | 'price_asc' | 'price_desc' | 'visits';



