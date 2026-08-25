import type { UserProfile, Restaurant, Friend, DiningMeetup, FriendRequest } from '../types';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyC4q6Yjitywklgz3zbpA24n5-8IRWb7dxc",
  authDomain: "bitemap-app.firebaseapp.com",
  projectId: "bitemap-app",
  storageBucket: "bitemap-app.firebasestorage.app",
  messagingSenderId: "1066311073412",
  appId: "1:1066311073412:web:3dac32861f59b22adc8cd1",
  measurementId: "G-28VG27WN12"
};

const STORAGE_KEY_FIREBASE_CONFIG = 'bitemap_firebase_config_v1';

export function loadSavedFirebaseConfig(): FirebaseConfigType {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load firebase config', err);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfigType): void {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save firebase config', err);
  }
}

// Dynamic Firebase Loader to ensure 100% build compatibility on any CI/CD environment
let firebaseModules: any = null;

async function loadFirebaseModules() {
  if (firebaseModules) return firebaseModules;

  try {
    // Dynamically load Firebase SDK via ESM CDN
    const [appMod, authMod, firestoreMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js' as any),
      import('https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js' as any),
      import('https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js' as any),
    ]);

    const config = loadSavedFirebaseConfig();
    const app = appMod.getApps().length === 0 ? appMod.initializeApp(config) : appMod.getApp();
    const auth = authMod.getAuth(app);
    const db = firestoreMod.getFirestore(app);
    const googleProvider = new authMod.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    firebaseModules = {
      app,
      auth,
      db,
      googleProvider,
      authMod,
      firestoreMod,
    };
    return firebaseModules;
  } catch (err) {
    console.error('Failed to load Firebase modules', err);
    return null;
  }
}

export interface GoogleUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// 🔵 1-Click Google Sign-In & Account Linking
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: GoogleUser;
  message: string;
}> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) {
      return {
        success: false,
        message: 'Firebase 初始化中，請檢查網路連線後重試！',
      };
    }

    const result = await fb.authMod.signInWithPopup(fb.auth, fb.googleProvider);
    const u = result.user;
    return {
      success: true,
      user: {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
      },
      message: `🎉 成功登入 Google 帳號：${u.displayName || u.email}！`,
    };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, message: '已取消 Google 登入視窗。' };
    }
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
      return { 
        success: false, 
        message: 'Google 登入尚未在 Firebase Console 中啟用，請至「Authentication ➔ 登入方式 ➔ Google」點選啟用！' 
      };
    }
    return {
      success: false,
      message: `Google 登入失敗：${err.message || '請確認網路與 Firebase 授權'}`,
    };
  }
}

// 🔴 Sign Out
export async function signOutGoogle(): Promise<void> {
  const fb = await loadFirebaseModules();
  if (fb) {
    try {
      await fb.authMod.signOut(fb.auth);
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  }
}

// ☁️ Cloud Sync: Push Full Local Data to Firestore under User's Google UID
export async function syncDataToCloud(
  userId: string,
  payload: {
    profile: UserProfile;
    restaurants: Restaurant[];
    friends: Friend[];
    meetups: DiningMeetup[];
    friendRequests: FriendRequest[];
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return { success: false, message: '未連線至 Firebase' };

    const userDocRef = fb.firestoreMod.doc(fb.db, 'bitemap_users', userId);
    await fb.firestoreMod.setDoc(userDocRef, {
      ...payload,
      updatedAt: new Date().toISOString(),
      serverTimestamp: fb.firestoreMod.serverTimestamp(),
    }, { merge: true });

    return { success: true, message: '☁️ 全站美食地圖與好友資料已成功備份至 Google 雲端！' };
  } catch (err: any) {
    console.error('Failed to sync to cloud', err);
    return { success: false, message: `雲端同步失敗：${err.message}` };
  }
}

// 📥 Cloud Restore: Pull Full Data from Firestore under User's Google UID
export async function fetchUserDataFromCloud(userId: string): Promise<{
  success: boolean;
  data?: {
    profile?: UserProfile;
    restaurants?: Restaurant[];
    friends?: Friend[];
    meetups?: DiningMeetup[];
    friendRequests?: FriendRequest[];
  };
  message: string;
}> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return { success: false, message: '未連線至 Firebase' };

    const userDocRef = fb.firestoreMod.doc(fb.db, 'bitemap_users', userId);
    const snap = await fb.firestoreMod.getDoc(userDocRef);
    if (!snap.exists()) {
      return { success: false, message: '此 Google 帳號在雲端尚未有任何備份紀錄。' };
    }
    const data = snap.data();
    return {
      success: true,
      data: {
        profile: data.profile,
        restaurants: data.restaurants,
        friends: data.friends,
        meetups: data.meetups,
        friendRequests: data.friendRequests,
      },
      message: '🎉 成功從 Google 雲端載入您的吃貨資料！',
    };
  } catch (err: any) {
    console.error('Failed to fetch from cloud', err);
    return { success: false, message: `讀取雲端資料失敗：${err.message}` };
  }
}


// 🌐 Publish or Update a Public Restaurant to Firestore Community Feed
export async function publishPublicRestaurantToCloud(
  restaurant: Restaurant,
  authorProfile?: UserProfile
): Promise<void> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return;

    const docRef = fb.firestoreMod.doc(fb.db, 'bitemap_public_restaurants', restaurant.id);
    if (restaurant.visibility === 'private' || restaurant.visibility === 'friends_only') {
      // If changed to non-public, remove from public feed
      try {
        await fb.firestoreMod.deleteDoc(docRef);
      } catch {}
      return;
    }

    await fb.firestoreMod.setDoc(docRef, {
      ...restaurant,
      visibility: 'public',
      authorFoodieId: authorProfile?.foodieId || 'foodie',
      authorName: authorProfile?.name || '熱心吃貨',
      authorAvatar: authorProfile?.avatar || '🥢',
      publishedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to publish public restaurant', err);
  }
}

// 🌐 Fetch all Community Public Restaurants from Firestore
export async function fetchCommunityPublicRestaurants(): Promise<Restaurant[]> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return [];

    const colRef = fb.firestoreMod.collection(fb.db, 'bitemap_public_restaurants');
    const snap = await fb.firestoreMod.getDocs(colRef);
    const list: Restaurant[] = [];
    snap.forEach((docSnap: any) => {
      list.push(docSnap.data() as Restaurant);
    });
    return list;
  } catch (err) {
    console.error('Failed to fetch community public restaurants', err);
    return [];
  }
}
