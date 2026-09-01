
import type { Restaurant, Friend, DiningMeetup, FriendRequest, UserProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  foodieId: 'guest',
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
      foodieId: profile?.foodieId || 'my_id',
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
    const profile = loadUserProfile();
    if (!profile.foodieId || profile.foodieId === 'guest') {
      return [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((f: any) => ({
          ...f,
          avatar: f.avatar || '🥢',
          favoriteTags: Array.isArray(f.favoriteTags) ? f.favoriteTags : [],
          dislikedTags: Array.isArray(f.dislikedTags) ? f.dislikedTags : [],
          myObservedFavorites: Array.isArray(f.myObservedFavorites) ? f.myObservedFavorites : [],
          myObservedDislikes: Array.isArray(f.myObservedDislikes) ? f.myObservedDislikes : [],
          customNickname: f.customNickname || undefined,
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


export const INITIAL_MEETUPS: DiningMeetup[] = [];

export function loadMeetups(): DiningMeetup[] {
  try {
    const raw = localStorage.getItem('bitemap_meetups_v1') || localStorage.getItem('bitemap_meetups');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('bitemap_meetups_v1', JSON.stringify(INITIAL_MEETUPS));
    return INITIAL_MEETUPS;
  } catch {
    return INITIAL_MEETUPS;
  }
}

export function saveMeetups(meetups: DiningMeetup[]): void {
  try {
    localStorage.setItem('bitemap_meetups_v1', JSON.stringify(meetups));
    localStorage.removeItem('bitemap_meetups');
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

export const INITIAL_ACCOUNT_REGISTRY: Record<string, AccountRecord> = {};

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

// 🔐 Save or Register Account to Registry (100% Failproof)
export function registerOrUpdateAccount(
  profile: UserProfile,
  restaurants?: Restaurant[],
  friends?: Friend[],
  meetups?: DiningMeetup[]
): void {
  const cleanId = (profile.foodieId || '').trim().toLowerCase();
  const cleanPin = String(profile.pinCode || '8888').trim();
  
  if (!cleanId) return;

  const registry = loadAccountRegistry();

  const record: AccountRecord = {
    foodieId: cleanId,
    pinCode: cleanPin,
    profile: {
      ...profile,
      foodieId: cleanId,
      pinCode: cleanPin,
    },
    restaurants: restaurants || loadRestaurants(),
    friends: friends || loadFriends(),
    meetups: meetups || [],
  };

  registry[cleanId] = record;
  saveAccountRegistry(registry);
  saveUserProfile(record.profile);
}

// 🔑 Login Account (Intelligent extraction, case-insensitive, forgiving PIN)
export function authenticateAndLoginAccount(foodieId: string, pinCode?: string): {
  success: boolean;
  message: string;
  account?: AccountRecord;
} {
  let cleanId = (foodieId || '').trim().toLowerCase();
  let cleanPin = String(pinCode || '').trim();

  // If user typed ID#PIN into ID input (e.g. "boop#1234")
  if (cleanId.includes('#')) {
    const parts = cleanId.split('#');
    cleanId = parts[0].trim();
    if (!cleanPin && parts[1]) {
      cleanPin = parts[1].trim();
    }
  }

  if (!cleanId) {
    return { success: false, message: '請輸入吃貨 ID！' };
  }

  const registry = loadAccountRegistry();
  
  // Find case-insensitive match
  let accKey = Object.keys(registry).find((k) => k.toLowerCase() === cleanId);
  let acc = accKey ? registry[accKey] : undefined;

  // Fallback: check current active profile in localStorage
  if (!acc) {
    const current = loadUserProfile();
    if (current.foodieId && current.foodieId.toLowerCase() === cleanId) {
      acc = {
        foodieId: current.foodieId.toLowerCase(),
        pinCode: String(current.pinCode || '8888').trim(),
        profile: current,
        restaurants: loadRestaurants(),
        friends: loadFriends(),
        meetups: [],
      };
      registry[cleanId] = acc;
      saveAccountRegistry(registry);
    }
  }

  if (!acc) {
    // If only one account exists in registry, help user understand
    const savedKeys = Object.keys(registry);
    return { 
      success: false, 
      message: `查無吃貨 ID【${foodieId}】！本機已存帳號：${savedKeys.join(', ')}。若這是新帳號請點選「註冊新 ID」。` 
    };
  }

  const storedPin = String(acc.pinCode || '8888').trim();
  
  // Allow login if PIN matches or if empty (for convenient local use)
  if (cleanPin && storedPin && storedPin !== cleanPin) {
    return { success: false, message: `認證失敗！4 碼安全 PIN 密碼不符 (輸入: ${cleanPin})，請重新輸入。` };
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
    // 1. Clean Restaurants
    ['bitemap_restaurants_v1', 'bitemap_restaurants'].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const realOnly = list.filter((r: any) => {
              if (['r1', 'r2', 'r3', 'r4', 'as', 'asas', 'asd'].includes(r.id)) return false;
              if (r.id?.startsWith('mock_')) return false;
              if (['as', 'asas', 'asd'].includes(r.name?.toLowerCase())) return false;
              if (r.name?.includes('TAMED') || r.name?.includes('詹記')) return false;
              return true;
            });
            localStorage.setItem('bitemap_restaurants_v1', JSON.stringify(realOnly));
          }
        } catch {}
      }
    });

    // 2. Clean Friends
    ['bitemap_friends_v1', 'bitemap_friends'].forEach((key) => {
      const rawFriends = localStorage.getItem(key);
      if (rawFriends) {
        try {
          const flist = JSON.parse(rawFriends);
          if (Array.isArray(flist)) {
            const realFriends = flist.filter((f: any) => !['f1', 'f2', 'f3', 'f4'].includes(f.id) && !f.id?.startsWith('mock_'));
            localStorage.setItem('bitemap_friends_v1', JSON.stringify(realFriends));
          }
        } catch {}
      }
    });

    // 3. Clean Meetups / Social Board (Purge m1, m2, mock_)
    ['bitemap_meetups_v1', 'bitemap_meetups'].forEach((key) => {
      const rawMeetups = localStorage.getItem(key);
      if (rawMeetups) {
        try {
          const mlist = JSON.parse(rawMeetups);
          if (Array.isArray(mlist)) {
            const realMeetups = mlist.filter((m: any) => !['m1', 'm2'].includes(m.id) && !m.id?.startsWith('mock_'));
            localStorage.setItem('bitemap_meetups_v1', JSON.stringify(realMeetups));
            localStorage.removeItem('bitemap_meetups');
          }
        } catch {}
      }
    });

    // 4. Clean Friend Requests
    const rawFreq = localStorage.getItem('bitemap_friend_requests_v1');
    if (rawFreq) {
      try {
        const reqList = JSON.parse(rawFreq);
        if (Array.isArray(reqList)) {
          const realReqs = reqList.filter((r: any) => !r.id?.startsWith('mock_') && !r.id?.startsWith('m_') && !['kaw_foodie', 'annie_sweets', 'ming_ramen', 'kevin_meat'].includes(r.senderFoodieId));
          localStorage.setItem('bitemap_friend_requests_v1', JSON.stringify(realReqs));
        }
      } catch {}
    }

    // 5. Clean Account Registry
    const rawAcc = localStorage.getItem('bitemap_account_registry_v1');
    if (rawAcc) {
      try {
        const reg = JSON.parse(rawAcc);
        const dummyKeys = ['kaw_foodie', 'annie_sweets', 'ming_ramen', 'kevin_meat'];
        let changed = false;
        dummyKeys.forEach((k) => {
          if (reg[k]) {
            delete reg[k];
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('bitemap_account_registry_v1', JSON.stringify(reg));
        }
      } catch {}
    }
  } catch (e) {
    console.error('Failed to purge mock data', e);
  }
}
