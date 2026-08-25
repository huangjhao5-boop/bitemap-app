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

    // Enable anonymous auth session if not already logged in so Firestore read/write rules never fail
    if (!auth.currentUser && authMod.signInAnonymously) {
      authMod.signInAnonymously(auth).catch((e: any) => console.log('Firebase anonymous session', e));
    }
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


// Pre-warm Firebase modules immediately so popups are never blocked by async click delay
if (typeof window !== 'undefined') {
  loadFirebaseModules().catch((e) => console.log('Firebase prewarm', e));
}

export interface GoogleUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// 🔵 1-Click Google Sign-In & Account Linking (Instant Direct Popup)
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
        message: 'Firebase 初始化中，請稍候重試！',
      };
    }

    // Try popup first (instant responsive window)
    try {
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
    } catch (popupErr: any) {
      console.warn('Popup attempt failed, trying redirect fallback...', popupErr);
      if (popupErr.code === 'auth/popup-closed-by-user') {
        return { success: false, message: '已關閉 Google 登入視窗。' };
      }
      // If popup is blocked by browser/PWA, fallback to redirect
      if (
        popupErr.code === 'auth/popup-blocked' ||
        popupErr.code === 'auth/cancelled-popup-request' ||
        popupErr.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await fb.authMod.signInWithRedirect(fb.auth, fb.googleProvider);
        return {
          success: true,
          message: '正在為您切換至 Google 安全跳轉授權頁面...',
        };
      }
      throw popupErr;
    }
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
      return { 
        success: false, 
        message: 'Google 登入尚未在 Firebase Console 中啟用，請至「Authentication ➔ 登入方式 ➔ Google」點選啟用！' 
      };
    }
    if (err.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        message: '此網域尚未加入 Firebase 已授權網域，請至 Firebase 控制台 ➔ Authentication ➔ 設定 ➔ 新增已授權網域！',
      };
    }
    return {
      success: false,
      message: `Google 登入失敗：${err.message || '請確認網路連線'}`,
    };
  }
}

// 📲 Check Redirect Auth Result on App Mount (Crucial for PWA Standalone Mode)
export async function checkAndHandleRedirectResult(): Promise<GoogleUser | null> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return null;

    const result = await fb.authMod.getRedirectResult(fb.auth);
    if (result && result.user) {
      const u = result.user;
      return {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
      };
    }
  } catch (err) {
    console.error('Redirect result check error', err);
  }
  return null;
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



// 🆔 Cloud Account: Save Foodie ID Account Record to Firestore (Cross-Device Registry)
export async function saveFoodieAccountToCloud(
  account: {
    foodieId: string;
    pinCode: string;
    profile: UserProfile;
    restaurants: Restaurant[];
    friends: Friend[];
    meetups: DiningMeetup[];
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return { success: false, message: '未連線至 Firebase' };

    const cleanId = account.foodieId.toLowerCase().trim().replace(/[@#\s]/g, '');
    const docRef = fb.firestoreMod.doc(fb.db, 'bitemap_accounts', cleanId);

    await fb.firestoreMod.setDoc(docRef, {
      foodieId: cleanId,
      pinCode: String(account.pinCode || '8888').trim(),
      profile: account.profile,
      restaurants: account.restaurants || [],
      friends: account.friends || [],
      meetups: account.meetups || [],
      updatedAt: new Date().toISOString(),
      serverTimestamp: fb.firestoreMod.serverTimestamp(),
    }, { merge: true });

    // Also write public foodie profile for ID-based friend search
    const pubRef = fb.firestoreMod.doc(fb.db, 'bitemap_public_profiles', cleanId);
    await fb.firestoreMod.setDoc(pubRef, {
      foodieId: cleanId,
      name: account.profile.name || cleanId,
      avatar: account.profile.avatar || '🥢',
      favoriteTags: account.profile.favoriteTags || [],
      dislikedTags: account.profile.dislikedTags || [],
      bio: account.profile.bio || '',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('✅ Account synced to Cloud Firestore:', cleanId);
    return { success: true, message: '帳號已成功同步至雲端！' };
  } catch (err: any) {
    console.error('Failed to save account to cloud', err);
    return { success: false, message: `雲端同步失敗：${err.message}` };
  }
}

// 📥 Cloud Account: Fetch Foodie ID Account Record from Firestore
export async function fetchFoodieAccountFromCloud(foodieId: string): Promise<{
  success: boolean;
  account?: {
    foodieId: string;
    pinCode: string;
    profile: UserProfile;
    restaurants: Restaurant[];
    friends: Friend[];
    meetups: DiningMeetup[];
  };
  message: string;
}> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return { success: false, message: '未連線至 Firebase' };

    const cleanId = foodieId.toLowerCase().trim().replace(/[@#\s]/g, '');
    const docRef = fb.firestoreMod.doc(fb.db, 'bitemap_accounts', cleanId);
    const snap = await fb.firestoreMod.getDoc(docRef);

    if (!snap.exists()) {
      return { success: false, message: `雲端查無吃貨 ID【${cleanId}】！` };
    }

    const data = snap.data();
    return {
      success: true,
      account: {
        foodieId: data.foodieId,
        pinCode: String(data.pinCode || '8888').trim(),
        profile: data.profile,
        restaurants: data.restaurants || [],
        friends: data.friends || [],
        meetups: data.meetups || [],
      },
      message: '帳號已從雲端載入！',
    };
  } catch (err: any) {
    console.error('Failed to fetch account from cloud', err);
    return { success: false, message: `讀取雲端帳號失敗：${err.message}` };
  }
}

// 👥 Send Friend Request to Cloud (Cross-Device Routing)
export async function sendCloudFriendRequest(
  req: FriendRequest,
  targetFoodieId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb) return { success: false, message: '未連線至 Firebase 伺服器' };

    // Clean target ID (strip @, #, whitespace)
    const cleanTarget = targetFoodieId.toLowerCase().trim().replace(/[@#\s]/g, '');
    const cleanSender = (req.senderFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');

    const docRef = fb.firestoreMod.doc(fb.db, 'bitemap_friend_requests', req.id);

    await fb.firestoreMod.setDoc(docRef, {
      ...req,
      targetFoodieId: cleanTarget,
      senderFoodieId: cleanSender,
      status: 'pending',
      updatedAt: new Date().toISOString(),
      serverTimestamp: fb.firestoreMod.serverTimestamp(),
    });

    console.log('✅ Friend Request Delivered to Firestore for:', cleanTarget, req.id);

    return {
      success: true,
      message: `🎉 好友邀請已即時發送至【${cleanTarget}】！對方手機打開即可看到！`,
    };
  } catch (err: any) {
    console.error('Failed to send cloud friend request', err);
    return { success: false, message: `發送失敗：${err.message || '請確認網路連線'}` };
  }
}

// ⚡ Real-Time WebSocket Listener for Incoming Friend Requests (0-second instant notification!)
export async function listenToIncomingFriendRequests(
  myFoodieId: string,
  onUpdate: (requests: FriendRequest[]) => void
): Promise<() => void> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb || !myFoodieId || myFoodieId === 'guest') return () => {};

    const cleanMyId = myFoodieId.toLowerCase().trim().replace(/[@#\s]/g, '');
    const colRef = fb.firestoreMod.collection(fb.db, 'bitemap_friend_requests');
    
    // Single field index query for 100% Firestore reliability
    const q = fb.firestoreMod.query(
      colRef,
      fb.firestoreMod.where('targetFoodieId', '==', cleanMyId)
    );

    const unsubscribe = fb.firestoreMod.onSnapshot(q, (snapshot: any) => {
      const list: FriendRequest[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data() as FriendRequest;
        if (data.status === 'pending') {
          list.push(data);
        }
      });
      console.log('📬 Live friend requests snapshot received for', cleanMyId, list);
      onUpdate(list);
    }, (err: any) => {
      console.error('onSnapshot friend requests error', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to setup real-time friend request listener', err);
    return () => {};
  }
}

// 🤝 Respond to Cloud Friend Request (Accept or Decline)
export async function respondToCloudFriendRequest(
  requestId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  try {
    const fb = await loadFirebaseModules();
    if (!fb || !requestId) return;

    const docRef = fb.firestoreMod.doc(fb.db, 'bitemap_friend_requests', requestId);
    await fb.firestoreMod.updateDoc(docRef, {
      status,
      respondedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to respond to cloud friend request', err);
  }
}
