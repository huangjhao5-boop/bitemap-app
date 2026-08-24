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
  foodieId?: string;
  status?: 'accepted' | 'pending';
  boundAt?: string;
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


export interface FriendRequest {
  id: string;
  senderFoodieId: string;
  senderName: string;
  senderAvatar: string;
  favoriteTags: string[];
  dislikedTags: string[];
  bio?: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface UserProfile {
  foodieId: string;
  pinCode: string;
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




export type MeetupAudience = 'public' | 'friends_only' | 'private';

export interface MeetupComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  image?: string;
  createdAt: string;
}


export interface DiningMeetup {
  id: string;
  title: string;
  restaurantId?: string;
  restaurantName: string;
  category?: string;
  address?: string;
  googleMapsUrl?: string;
  plannedDate: string;
  description: string;
  creatorName: string;
  creatorAvatar: string;
  audience: MeetupAudience;
  targetFriendIds?: string[];
  joinedFriendIds: string[];
  interestedFriendIds: string[];
  comments: MeetupComment[];
  status: 'open' | 'closed';
  createdAt: string;
}
