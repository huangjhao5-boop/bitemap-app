
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

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [];

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
  try {
    const payload = {
      foodieId: profile?.foodieId || 'kaw_foodie',
      name: profile?.name || '吃貨好友',
      avatar: profile?.avatar || '🥢',
      favoriteTags: profile?.favoriteTags || [],
      dislikedTags: profile?.dislikedTags || [],
      bio: profile?.bio || '',
      timestamp: Date.now(),
    };
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  } catch (err) {
    console.error('Failed to generate token', err);
    return 'token_fallback';
  }
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



export const INITIAL_FRIENDS: Friend[] = [];

export const INITIAL_RESTAURANTS: Restaurant[] = [];

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


export function loadUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        foodieId: parsed.foodieId || DEFAULT_USER_PROFILE.foodieId,
        pinCode: parsed.pinCode || DEFAULT_USER_PROFILE.pinCode,
        favoriteTags: Array.isArray(parsed.favoriteTags) ? parsed.favoriteTags : DEFAULT_USER_PROFILE.favoriteTags,
        dislikedTags: Array.isArray(parsed.dislikedTags) ? parsed.dislikedTags : DEFAULT_USER_PROFILE.dislikedTags,
      };
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
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((f: any) => ({
          ...f,
          avatar: f.avatar || '🥢',
          favoriteTags: Array.isArray(f.favoriteTags) ? f.favoriteTags : [],
          dislikedTags: Array.isArray(f.dislikedTags) ? f.dislikedTags : [],
        }));
      }
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


export interface AccountRecord {
  foodieId: string;
  pinCode: string;
  profile: UserProfile;
  restaurants: Restaurant[];
  friends: Friend[];
  meetups: DiningMeetup[];
}

export const INITIAL_ACCOUNT_REGISTRY: Record<string, AccountRecord> = {
  'kaw_foodie': {
    foodieId: 'kaw_foodie',
    pinCode: '8888',
    profile: {
      foodieId: 'kaw_foodie',
      pinCode: '8888',
      name: '吃貨探險家 Kevin',
      avatar: '🥢',
      bio: '探索全城短影音美食，真心記錄必吃與避雷！',
      defaultCity: '台北市',
      instagramHandle: 'kaw_foodie',
      favoriteTags: ['日式拉麵', '和牛燒肉', '手沖咖啡', '巴斯克乳酪'],
      dislikedTags: ['不吃香菜', '怕辣'],
      spicinessLevel: 'mild',
      budgetPreference: '$$',
      favoriteDrink: '無糖冰美式 / 熟成蜜香紅茶',
    },
    restaurants: INITIAL_RESTAURANTS,
    friends: INITIAL_FRIENDS,
    meetups: INITIAL_MEETUPS,
  },
  'annie_sweets': {
    foodieId: 'annie_sweets',
    pinCode: '1234',
    profile: {
      foodieId: 'annie_sweets',
      pinCode: '1234',
      name: '安妮 (日本甜點控)',
      avatar: '🍮',
      bio: '旅居東京3年，熱愛探訪隱藏版喫茶店！想加入你的吃貨朋友圈互相避雷！',
      defaultCity: '東京',
      instagramHandle: 'annie_sweets_tokyo',
      favoriteTags: ['焦糖布丁', '抹茶聖代', '生吐司', '日式定食'],
      dislikedTags: ['太甜死甜', '油炸物'],
      spicinessLevel: 'none',
      budgetPreference: '$$$',
      favoriteDrink: '宇治抹茶拿鐵',
    },
    restaurants: [],
    friends: [],
    meetups: [],
  },
  'ming_ramen': {
    foodieId: 'ming_ramen',
    pinCode: '0000',
    profile: {
      foodieId: 'ming_ramen',
      pinCode: '0000',
      name: '小明 (拉麵狂人)',
      avatar: '🍜',
      bio: '全台拉麵百店巡禮中，重度豚骨愛好者。',
      defaultCity: '台北市',
      instagramHandle: 'ming_ramen_hunter',
      favoriteTags: ['日式拉麵', '厚切叉燒', '濃厚豚骨', '辛味噌'],
      dislikedTags: ['香菜', '生魚片'],
      spicinessLevel: 'hot',
      budgetPreference: '$$',
      favoriteDrink: '冰涼可樂',
    },
    restaurants: [],
    friends: [],
    meetups: [],
  },
  'kevin_meat': {
    foodieId: 'kevin_meat',
    pinCode: '6666',
    profile: {
      foodieId: 'kevin_meat',
      pinCode: '6666',
      name: '凱文 (肉食聚餐王)',
      avatar: '🥩',
      bio: '無肉不歡！大口吃和牛大口喝酒！',
      defaultCity: '台北市',
      instagramHandle: 'kevin_meat_king',
      favoriteTags: ['和牛燒肉', '麻辣鍋', '居酒屋', '精釀啤酒'],
      dislikedTags: ['素食沙拉', '不吃辣'],
      spicinessLevel: 'insane',
      budgetPreference: '$$$$',
      favoriteDrink: '精釀IPA生啤酒',
    },
    restaurants: [],
    friends: [],
    meetups: [],
  }
};

export function loadAccountRegistry(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem('bitemap_account_registry_v1');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('bitemap_account_registry_v1', JSON.stringify(INITIAL_ACCOUNT_REGISTRY));
    return INITIAL_ACCOUNT_REGISTRY;
  } catch {
    return INITIAL_ACCOUNT_REGISTRY;
  }
}

export function saveAccountRegistry(registry: Record<string, AccountRecord>): void {
  try {
    localStorage.setItem('bitemap_account_registry_v1', JSON.stringify(registry));
  } catch (err) {
    console.error('Failed to save account registry', err);
  }
}

// 🔐 Save or Register Account to Registry
export function registerOrUpdateAccount(
  profile: UserProfile,
  restaurants: Restaurant[],
  friends: Friend[],
  meetups: DiningMeetup[]
): void {
  const registry = loadAccountRegistry();
  registry[profile.foodieId] = {
    foodieId: profile.foodieId,
    pinCode: profile.pinCode,
    profile,
    restaurants,
    friends,
    meetups,
  };
  saveAccountRegistry(registry);
}

// 🔑 Login Account
export function authenticateAndLoginAccount(foodieId: string, pinCode: string): {
  success: boolean;
  message: string;
  account?: AccountRecord;
} {
  const registry = loadAccountRegistry();
  const acc = registry[foodieId];
  if (!acc) {
    return { success: false, message: `查無吃貨 ID【${foodieId}】！請確認 ID 是否正確或直接註冊新帳號。` };
  }
  if (acc.pinCode !== pinCode) {
    return { success: false, message: '認證失敗！4 碼安全 PIN 碼錯誤，請重新輸入。' };
  }
  return { success: true, message: `🎉 驗證成功！歡迎回來【${acc.profile.name}】！`, account: acc };
}

// 🔍 Search Pure Foodie ID for Friend Request
export function findFoodieProfileById(targetFoodieId: string): UserProfile | null {
  const registry = loadAccountRegistry();
  const acc = registry[targetFoodieId];
  return acc ? acc.profile : null;
}


export function purgeMockTestData(): void {
  try {
    const raw = localStorage.getItem('bitemap_restaurants_v1');
    if (raw) {
      const list = JSON.parse(raw);
      // Filter out dummy template ids (r1, r2, r3, r4)
      const realOnly = list.filter((r: any) => !['r1', 'r2', 'r3', 'r4'].includes(r.id));
      localStorage.setItem('bitemap_restaurants_v1', JSON.stringify(realOnly));
    }
    const rawFriends = localStorage.getItem('bitemap_friends_v1');
    if (rawFriends) {
      const flist = JSON.parse(rawFriends);
      const realFriends = flist.filter((f: any) => !['f1', 'f2', 'f3', 'f4'].includes(f.id));
      localStorage.setItem('bitemap_friends_v1', JSON.stringify(realFriends));
    }
  } catch (e) {
    console.error('Failed to purge mock data', e);
  }
}
