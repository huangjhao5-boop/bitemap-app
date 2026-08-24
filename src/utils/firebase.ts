import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
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

// User's configured Firebase Project
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
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load firebase config from storage', err);
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

// Initialize Firebase App
export function getFirebaseInstance() {
  const config = loadSavedFirebaseConfig();
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    return { app, auth, db, googleProvider };
  } catch (err) {
    console.error('Failed to initialize Firebase instance', err);
    return null;
  }
}

// 🔵 1-Click Google Sign-In & Account Linking
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: User;
  message: string;
}> {
  const fb = getFirebaseInstance();
  if (!fb) {
    return {
      success: false,
      message: 'Firebase 初始化失敗，請檢查設定！',
    };
  }

  try {
    const result = await signInWithPopup(fb.auth, fb.googleProvider);
    return {
      success: true,
      user: result.user,
      message: `🎉 成功登入 Google 帳號：${result.user.displayName || result.user.email}！`,
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
  const fb = getFirebaseInstance();
  if (fb) {
    try {
      await fbSignOut(fb.auth);
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
  const fb = getFirebaseInstance();
  if (!fb) return { success: false, message: '未連線至 Firebase' };

  try {
    const userDocRef = doc(fb.db, 'bitemap_users', userId);
    await setDoc(userDocRef, {
      ...payload,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
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
  const fb = getFirebaseInstance();
  if (!fb) return { success: false, message: '未連線至 Firebase' };

  try {
    const userDocRef = doc(fb.db, 'bitemap_users', userId);
    const snap = await getDoc(userDocRef);
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

// 👂 Listen to Auth State
export function onAuthChange(callback: (user: User | null) => void) {
  const fb = getFirebaseInstance();
  if (!fb) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(fb.auth, callback);
}
