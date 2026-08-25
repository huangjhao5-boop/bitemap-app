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
  foodieId?: string;
  name: string; // 對方公開暱稱 (雲端動態同步)
  avatar: string; // 對方公開頭像 (雲端動態同步)
  favoriteTags: string[]; // 對方公開喜好 (雲端動態同步)
  dislikedTags: string[]; // 對方公開忌口 (雲端動態同步)
  
  // 📝 自身私房觀察與專屬備忘 (本機專屬，雲端更新不會被覆蓋！)
  customNickname?: string; // 我的專屬備註外號
  myObservedFavorites?: string[]; // 我觀察到的愛吃美食
  myObservedDislikes?: string[]; // 我觀察到的忌口避雷
  notes?: string; // 私房備忘筆記
  
  status?: 'accepted' | 'pending';
  boundAt?: string;
}

export type DishRating = 'must_eat' | 'tasty' | 'mediocre' | 'avoid';

export interface DishItem {
  id: string;
  name: string;
  price?: string;
  rating?: DishRating;
  note?: string;
}

export interface RestaurantContribution {
  restaurantId: string;
  authorFoodieId?: string;
  authorName: string;
  authorAvatar: string;
  isMine: boolean;
  ratingTag: RestaurantRatingTag;
  visitCount: number;
  mustEatDishes: string[];
  avoidDishes: string[];
  personalNotes: string;
  videos?: ShortVideoSource[];
  menuDishes?: DishItem[];
  visibility?: 'public' | 'friends_only' | 'private';
  updatedAt?: string;
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
  menuImages?: string[];
  menuDishes?: DishItem[];
  visibility?: 'public' | 'friends_only' | 'private';
  authorFoodieId?: string;
  authorName?: string;
  authorAvatar?: string;
  contributions?: RestaurantContribution[];
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
  status: 'pending' | 'accepted' | 'declined' | 'unfriended';
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
  googleEmail?: string;
  googleUid?: string;
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
