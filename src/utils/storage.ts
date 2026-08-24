
import type { Restaurant, Friend, DiningMeetup, FriendRequest, UserProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  foodieId: 'kaw_foodie',
  pinCode: '8888',
  name: '吃貨探險家',
  avatar: '🥢',
  bio: '探索全城短影音美食，真心記錄必吃與避雷！',
  defaultCity: '台北市',
  instagramHandle: 'foodie_daily',
  favoriteTags: ['日式拉麵', '和牛燒肉', '手沖咖啡', '巴斯克乳酪'],
  dislikedTags: ['不吃香菜', '怕辣'],
  spicinessLevel: 'mild' as const,
  budgetPreference: '$$' as const,
  favoriteDrink: '無糖冰美式 / 焙茶拿鐵',
};

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req_1',
    senderFoodieId: 'FOODIE-8842',
    senderName: '安妮 (日本甜點控)',
    senderAvatar: '🍮',
    favoriteTags: ['焦糖布丁', '抹茶聖代', '生吐司', '日式定食'],
    dislikedTags: ['太甜死甜', '油炸物'],
    bio: '旅居東京3年，熱愛探訪隱藏版喫茶店！想加入你的吃貨朋友圈互相避雷！',
    sentAt: '2026-08-24 15:30',
    status: 'pending',
  },
  {
    id: 'req_2',
    senderFoodieId: 'FOODIE-3310',
    senderName: '阿豪 (精釀啤酒漢堡)',
    senderAvatar: '🍔',
    favoriteTags: ['美式漢堡', '精釀IPA', '水牛城辣雞翅', '和牛排餐'],
    dislikedTags: ['素食沙拉', '不吃辣'],
    bio: '下班常常找人喝一杯吃漢堡，希望能一起抽盲盒聚餐！',
    sentAt: '2026-08-24 16:10',
    status: 'pending',
  }
];

export function loadFriendRequests(): FriendRequest[] {
  try {
    const raw = localStorage.getItem('bitemap_friend_requests_v1');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('bitemap_friend_requests_v1', JSON.stringify(INITIAL_FRIEND_REQUESTS));
    return INITIAL_FRIEND_REQUESTS;
  } catch {
    return INITIAL_FRIEND_REQUESTS;
  }
}

export function saveFriendRequests(requests: FriendRequest[]): void {
  try {
    localStorage.setItem('bitemap_friend_requests_v1', JSON.stringify(requests));
    triggerAutoSync();
  } catch (err) {
    console.error('Failed to save friend requests', err);
  }
}

// 🪪 Generate Friend Invite Base64 Token
export function generateFriendInviteToken(profile: UserProfile): string {
  const payload = {
    foodieId: profile.foodieId || 'kaw_foodie',
pinCode: profile.pinCode || '8888',
    name: profile.name,
    avatar: profile.avatar,
    favoriteTags: profile.favoriteTags,
    dislikedTags: profile.dislikedTags,
    bio: profile.bio,
    timestamp: Date.now(),
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

// 📥 Parse Friend Invite Token
export function parseFriendInviteToken(token: string): FriendRequest | null {
  try {
    const jsonStr = decodeURIComponent(atob(token));
    const data = JSON.parse(jsonStr);
    if (!data.foodieId || !data.name) return null;
    return {
      id: 'req_' + Date.now(),
      senderFoodieId: data.foodieId,
      senderName: data.name,
      senderAvatar: data.avatar || '🥢',
      favoriteTags: data.favoriteTags || [],
      dislikedTags: data.dislikedTags || [],
      bio: data.bio || '',
      sentAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
  } catch (err) {
    console.error('Failed to parse friend token', err);
    return null;
  }
}



export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: '小明 (拉麵狂人)',
    avatar: '🍜',
    favoriteTags: ['拉麵', '厚切叉燒', '濃郁豚骨', '辛味噌'],
    dislikedTags: ['香菜', '生魚片', '甜點太甜'],
    notes: '極度愛吃重口味拉麵，每週至少吃三次。',
  },
  {
    id: 'f2',
    name: '阿美 (甜點咖啡胃)',
    avatar: '🍰',
    favoriteTags: ['手沖咖啡', '巴斯克乳酪', '肉桂捲', '早午餐'],
    dislikedTags: ['怕辣', '油炸物', '內臟類'],
    notes: '熱愛採點文青咖啡廳，對甜點水準要求很高。',
  },
  {
    id: 'f3',
    name: '凱文 (肉食聚餐王)',
    avatar: '🥩',
    favoriteTags: ['和牛燒肉', '麻辣鍋', '居酒屋', '精釀啤酒'],
    dislikedTags: ['素食餐廳', '乳糖不耐'],
    notes: '大胃王聚餐首選，無肉不歡，酒量很好。',
  },
  {
    id: 'f4',
    name: 'Peggy (健康輕食派)',
    avatar: '🥗',
    favoriteTags: ['健康低卡餐', '地中海料理', '果昔', '義大利麵'],
    dislikedTags: ['不吃牛', '太油膩', '路邊攤衛生不佳'],
    notes: '健身中，偏好蛋白質充足與少油少鹽的餐廳。',
  }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: '隱家拉麵 赤峰店',
    category: '日式拉麵',
    city: '台北市',
    address: '台北市大同區南京西路25巷28號',
    lat: 25.0538,
    lng: 121.5205,
    googleMapsUrl: 'https://maps.app.goo.gl/yYvT7Y',
    googleRating: 4.6,
    priceRange: '$$',
    ratingTag: 'must_eat',
    visitCount: 6,
    lastVisitedDate: '2026-08-12',
    mustEatDishes: ['辛豚骨拉麵（硬麵、濃湯）', '濃厚干貝沾麵', '特製叉燒拼盤'],
    avoidDishes: ['黃金雞湯拉麵（湯頭相對清淡略顯普通）'],
    personalNotes: '平日晚上排隊約 30 分鐘，建議開店前 15 分鐘到。沾麵醬汁超級濃郁！加麵免費一次。',
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    videos: [
      {
        id: 'v1',
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/C3x9P_abc12/',
        creatorName: 'foodie_taipei_daily',
        title: '台北中山站赤峰街必吃沾麵！濃郁干貝湯頭大公開',
        highlights: ['干貝精華濃湯', '炙燒厚叉燒', '排隊神店']
      },
      {
        id: 'v2',
        platform: 'youtube',
        url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        creatorName: '拉麵探險隊',
        title: '台北必訪排隊拉麵 TOP 5 隱家拉麵',
        highlights: ['濃厚系豚骨']
      }
    ],
    recommendedByFriendIds: ['f1'],
    dinedWithFriendIds: ['f1', 'f3'],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-08-12T19:30:00Z',
  },
  {
    id: 'r2',
    name: '路易奇電力公司 燒肉',
    category: '燒肉居酒屋',
    city: '台北市',
    address: '台北市大安區復興南路一段79巷4弄4號',
    lat: 25.0442,
    lng: 121.5441,
    googleMapsUrl: 'https://maps.app.goo.gl/9ZpL9Q',
    googleRating: 4.7,
    priceRange: '$$$',
    ratingTag: 'frequent_visit',
    visitCount: 4,
    lastVisitedDate: '2026-07-28',
    mustEatDishes: ['頂級薄切蔥鹽牛舌', '和牛扇子肉', '松露干貝漢堡', '明太子烤飯糰'],
    avoidDishes: ['牛五花（油脂稍厚容易膩口）'],
    personalNotes: '自己烤有半價優惠！調味料區松露醬跟鹽昆布無限取用超佛心，非常適合跟朋友聚會大口吃肉。',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    videos: [
      {
        id: 'v3',
        platform: 'tiktok',
        url: 'https://www.tiktok.com/@bbq_king/video/73219481928371',
        creatorName: '燒肉達人Kevin',
        title: '只要自己動手烤直接半價！松露醬無限沾的和牛燒肉',
        highlights: ['和牛半價', '松露自由', '聚餐首選']
      }
    ],
    recommendedByFriendIds: ['f3'],
    dinedWithFriendIds: ['f3', 'f2'],
    createdAt: '2026-05-15T12:00:00Z',
    updatedAt: '2026-07-28T21:00:00Z',
  },
  {
    id: 'r3',
    name: '某某甜點 Quelques Gouttes',
    category: '法式甜點',
    city: '台北市',
    address: '台北市大安區安和路一段102巷23號',
    lat: 25.0345,
    lng: 121.5512,
    googleMapsUrl: 'https://maps.app.goo.gl/k1pP7A',
    googleRating: 4.5,
    priceRange: '$$',
    ratingTag: 'must_eat',
    visitCount: 5,
    lastVisitedDate: '2026-08-05',
    mustEatDishes: ['聖多諾黑泡芙塔（大推鐵觀音口味）', '蜂蜜威士忌起司', '大溪地香草千層'],
    avoidDishes: ['今日特調冰茶（風味偏淡且偏貴）'],
    personalNotes: '聖多諾黑焦糖千層酥脆到升天！內用座位較少，建議下午 1:00 一開門就先搶候位或外帶。',
    coverImage: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    videos: [
      {
        id: 'v4',
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/C8qL10mPzX9/',
        creatorName: 'sweet_dessert_map',
        title: '台北最頂法式聖多諾黑泡芙！酥脆焦糖切下去的療癒酥脆聲',
        highlights: ['鐵觀音聖多諾黑', '酥脆千層', '極致法式']
      }
    ],
    recommendedByFriendIds: ['f2'],
    dinedWithFriendIds: ['f2', 'f4'],
    createdAt: '2026-04-10T14:00:00Z',
    updatedAt: '2026-08-05T16:00:00Z',
  },
  {
    id: 'r4',
    name: '網紅排隊熔岩起司漢堡排 (踩雷紀錄)',
    category: '美式漢堡',
    city: '台北市',
    address: '台北市信義區忠孝東路五段188號',
    lat: 25.0416,
    lng: 121.5689,
    googleMapsUrl: 'https://maps.app.goo.gl/m2kK3P',
    googleRating: 3.2,
    priceRange: '$$$',
    ratingTag: 'avoid_again',
    visitCount: 1,
    lastVisitedDate: '2026-07-10',
    mustEatDishes: ['現炸松露薯條（唯一及格的附餐）'],
    avoidDishes: ['爆漿瀑布起司雙層漢堡排（起司冷掉像塑膠、肉排過鹹且乾柴）', '草莓起司奶昔（死甜人工香精感）'],
    personalNotes: '被 IG 短影音視覺效果騙去排了一小時... 肉汁很少且油煙味很重，價格偏貴 CP 值極低，絕對不會再去第二次！',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    videos: [
      {
        id: 'v5',
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/C2oPQz1Abcd/',
        creatorName: 'hype_foods_daily',
        title: '誇張！超罪惡瀑布起司起司瀑布漢堡排',
        highlights: ['視覺震撼', '起司控必去？']
      }
    ],
    recommendedByFriendIds: [],
    dinedWithFriendIds: ['f3'],
    createdAt: '2026-07-10T20:00:00Z',
    updatedAt: '2026-07-10T20:00:00Z',
  },
  {
    id: 'r5',
    name: '詹記麻辣火鍋 敦南店',
    category: '火鍋鍋物',
    city: '台北市',
    address: '台北市大安區和平東路三段60號',
    lat: 25.0248,
    lng: 121.5488,
    googleMapsUrl: 'https://maps.app.goo.gl/Z8hR6L',
    googleRating: 4.6,
    priceRange: '$$$',
    ratingTag: 'must_eat',
    visitCount: 8,
    lastVisitedDate: '2026-08-18',
    mustEatDishes: ['如果只能點一樣：鴨血（果凍感全台最頂）', '招牌純糯米血糕', '飛天麻辣排骨酥', '白菊烏梅汁'],
    avoidDishes: ['草蝦漿（相較其他食材表現中規中矩）'],
    personalNotes: '每個月1號凌晨搶訂位！鴨血真的吸滿湯汁嫩到不行。復古台味電梯裝潢很有趣。',
    coverImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    videos: [
      {
        id: 'v6',
        platform: 'youtube',
        url: 'https://www.youtube.com/shorts/9bZkp7q19f0',
        creatorName: '火鍋狂魔',
        title: '這絕對是全台北最滑嫩的果凍鴨血！詹記麻辣鍋隱藏點法',
        highlights: ['果凍鴨血', '復古風', '秒殺訂位']
      }
    ],
    recommendedByFriendIds: ['f3'],
    dinedWithFriendIds: ['f1', 'f3'],
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-08-18T22:00:00Z',
  },
  {
    id: 'r6',
    name: 'TAMED FOX 信義店',
    category: '早午餐輕食',
    city: '台北市',
    address: '台北市信義區松仁路91號B1',
    lat: 25.0352,
    lng: 121.5671,
    googleMapsUrl: 'https://maps.app.goo.gl/W5rD8K',
    googleRating: 4.4,
    priceRange: '$$',
    ratingTag: 'wishlist',
    visitCount: 0,
    mustEatDishes: ['燻鮭魚酪梨酸種麵包', '巴西莓果碗 (Acai Bowl)', '胡蘿蔔蛋糕'],
    avoidDishes: [],
    personalNotes: 'Peggy 強烈推薦的健康早午餐！短影音看起來酪梨給超厚，週末採光很好，已列入口袋清單。',
    coverImage: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    videos: [
      {
        id: 'v7',
        platform: 'instagram',
        url: 'https://www.instagram.com/reel/C7u1PklM789/',
        creatorName: 'healthy_brunch_guide',
        title: '信義區最美健康早午餐！滿滿酪梨與巴西莓碗',
        highlights: ['高蛋白', '酪梨控', '寵物友善']
      }
    ],
    recommendedByFriendIds: ['f4', 'f2'],
    dinedWithFriendIds: [],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  }
];

const STORAGE_KEYS = {
  RESTAURANTS: 'bitemap_restaurants_v1',
  FRIENDS: 'bitemap_friends_v1',
  USER_PROFILE: 'bitemap_user_profile_v1',
  LAST_SYNC: 'bitemap_last_sync_v1',
};



export function getAutoSyncTime(): string {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || new Date().toLocaleTimeString();
}

export function triggerAutoSync(): string {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);
  return timeStr;
}


export function loadUserProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load user profile:', err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: any): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}


export function loadRestaurants(): Restaurant[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load restaurants from localStorage:', err);
  }
  return INITIAL_RESTAURANTS;
}

export function saveRestaurants(restaurants: Restaurant[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  } catch (err) {
    console.error('Failed to save restaurants to localStorage:', err);
  }
}

export function loadFriends(): Friend[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load friends from localStorage:', err);
  }
  return INITIAL_FRIENDS;
}

export function saveFriends(friends: Friend[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (err) {
    console.error('Failed to save friends to localStorage:', err);
  }
}

export function exportBackupData(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    restaurants: loadRestaurants(),
    friends: loadFriends(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);

    // If it's a public share pack from a friend, safely MERGE without overwriting personal notes or existing friends!
    if (parsed.isPublicPack && Array.isArray(parsed.restaurants)) {
      const currentList = loadRestaurants();
      const existingIds = new Set(currentList.map((r) => r.id));
      const existingNames = new Set(currentList.map((r) => r.name.toLowerCase()));

      let addedCount = 0;
      const mergedList = [...currentList];

      parsed.restaurants.forEach((incoming: Restaurant) => {
        if (!existingIds.has(incoming.id) && !existingNames.has(incoming.name.toLowerCase())) {
          mergedList.push(incoming);
          addedCount++;
        }
      });

      saveRestaurants(mergedList);
      return {
        success: true,
        message: `🎁 成功加入好友分享的美食名單！新增了 ${addedCount} 間餐廳（保留您原有的朋友名冊與個人私房筆記）。`,
      };
    }

    // Full Private Backup Import
    if (Array.isArray(parsed.restaurants)) {
      saveRestaurants(parsed.restaurants);
    }
    if (Array.isArray(parsed.friends)) {
      saveFriends(parsed.friends);
    }
    return { 
      success: true, 
      message: `成功匯入 ${parsed.restaurants?.length || 0} 間餐廳與 ${parsed.friends?.length || 0} 位朋友資料！` 
    };
  } catch (err: any) {
    return { success: false, message: `匯入失敗：${err.message}` };
  }
}


export const INITIAL_MEETUPS: DiningMeetup[] = [
  {
    id: 'm1',
    title: '🥩 週五下班路易奇燒肉小酌團！自己烤半價松露吃到飽',
    restaurantId: 'r2',
    restaurantName: '路易奇電力公司 燒肉',
    category: '燒肉居酒屋',
    address: '台北市大安區復興南路一段79巷4弄4號',
    googleMapsUrl: 'https://maps.app.goo.gl/9ZpL9Q',
    plannedDate: '本週五 19:30',
    description: '慶祝專案順利上線！目前已有 2 人，預計再揪 2~3 位愛吃牛舌與和牛的朋友！',
    creatorName: '吃貨小當家',
    creatorAvatar: '🧋',
    audience: 'public',
    joinedFriendIds: ['f1', 'f3'],
    interestedFriendIds: ['f2'],
    comments: [
      {
        id: 'c1',
        authorName: '小明 (拉麵狂人)',
        authorAvatar: '🍜',
        content: '這家松露醬配蔥鹽牛舌超猛，我一定要跟！',
        createdAt: '2026-08-24 12:30'
      },
      {
        id: 'c2',
        authorName: '凱文 (肉食聚餐王)',
        authorAvatar: '🥩',
        content: '算我一個，我已經把胃空出來了！',
        createdAt: '2026-08-24 14:15'
      }
    ],
    status: 'open',
    createdAt: '2026-08-24T10:00:00Z'
  },
  {
    id: 'm2',
    title: '🍰 週日下午大安文青下午茶探店（手沖+巴斯克乳酪）',
    restaurantId: 'r3',
    restaurantName: 'Fika Fika Cafe',
    category: '咖啡甜點',
    address: '台北市中山區伊通街33號',
    plannedDate: '本週日 14:30',
    description: '想放鬆喝杯好咖啡聊聊天，歡迎甜點控閨蜜同行！',
    creatorName: '阿美 (甜點咖啡胃)',
    creatorAvatar: '🍰',
    audience: 'friends_only',
    targetFriendIds: ['f2', 'f4'],
    joinedFriendIds: ['f2'],
    interestedFriendIds: [],
    comments: [
      {
        id: 'c3',
        authorName: 'Peggy (健康輕食派)',
        authorAvatar: '🥗',
        content: '這家拿鐵很順口，我週日有空！',
        createdAt: '2026-08-24 15:00'
      }
    ],
    status: 'open',
    createdAt: '2026-08-24T11:00:00Z'
  }
];

export function loadMeetups(): DiningMeetup[] {
  try {
    const raw = localStorage.getItem('bitemap_meetups');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('bitemap_meetups', JSON.stringify(INITIAL_MEETUPS));
    return INITIAL_MEETUPS;
  } catch {
    return INITIAL_MEETUPS;
  }
}

export function saveMeetups(meetups: DiningMeetup[]): void {
  try {
    localStorage.setItem('bitemap_meetups', JSON.stringify(meetups));
    triggerAutoSync();
  } catch (err) {
    console.error('Failed to save meetups', err);
  }
}
