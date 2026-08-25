import React, { useState } from 'react';
import type { UserProfile, Restaurant, Friend, DiningMeetup } from '../../types';
import type { Language } from '../../utils/i18n';
import { 
  signInWithGoogle,
  syncDataToCloud,
  fetchUserDataFromCloud,
} from '../../utils/firebase';
import { 
  authenticateAndLoginAccount, 
  registerOrUpdateAccount, 
  loadAccountRegistry,
} from '../../utils/storage';
import type { AccountRecord } from '../../utils/storage';
import { 
  X, 
  KeyRound, 
  UserPlus, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  restaurants: Restaurant[];
  friends: Friend[];
  meetups: DiningMeetup[];
  lang: Language;
  onLoginSuccess: (account: AccountRecord) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  restaurants,
  friends,
  meetups,
  lang,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  
  // Register State
  const [regId, setRegId] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regName, setRegName] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginId.trim();
    const pin = loginPin.trim();

    if (!id) {
      setStatusMessage({ type: 'error', text: '請輸入吃貨 ID！' });
      return;
    }

    const res = authenticateAndLoginAccount(id, pin);
    if (res.success && res.account) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        onLoginSuccess(res.account!);
        onClose();
      }, 500);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = regId.trim().toLowerCase().replace(/\s+/g, '');
    const pin = regPin.trim() || '8888';
    const name = regName.trim();

    if (!id || id.length < 2) {
      setStatusMessage({ type: 'error', text: '吃貨 ID 至少需要 2 個字元！' });
      return;
    }

    const registry = loadAccountRegistry();
    if (registry[id]) {
      setStatusMessage({ type: 'error', text: `吃貨 ID【${id}】已存在！若這是您的帳號請直接切換至「登入」輸入 4 碼 PIN。` });
      return;
    }

    const newProfile: UserProfile = {
      ...currentProfile,
      foodieId: id,
      pinCode: pin,
      name: name || id,
    };

    registerOrUpdateAccount(newProfile, restaurants, friends, meetups);

    setStatusMessage({
      type: 'success',
      text: `🎉 註冊成功！已正式綁定吃貨帳號【${id}#${pin}】！`,
    });

    setTimeout(() => {
      onLoginSuccess({
        foodieId: id,
        pinCode: pin,
        profile: newProfile,
        restaurants,
        friends,
        meetups,
      });
      onClose();
    }, 700);
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success || !res.user) {
        setStatusMessage({ type: 'error', text: res.message });
        setIsGoogleLoading(false);
        return;
      }

      const gUser = res.user;
      setStatusMessage({ type: 'success', text: `🎉 Google 登入成功：${gUser.displayName || gUser.email}` });

      // Check if user has cloud backup in Firestore
      const cloudRes = await fetchUserDataFromCloud(gUser.uid);
      if (cloudRes.success && cloudRes.data && cloudRes.data.profile) {
        // Restore from cloud
        const restoredProfile: UserProfile = {
          ...cloudRes.data.profile,
          googleEmail: gUser.email || undefined,
          googleUid: gUser.uid,
          avatar: currentProfile.avatar?.startsWith('data:') ? currentProfile.avatar : (gUser.photoURL || currentProfile.avatar),
        };

        onLoginSuccess({
          foodieId: restoredProfile.foodieId,
          pinCode: restoredProfile.pinCode,
          profile: restoredProfile,
          restaurants: cloudRes.data.restaurants || restaurants,
          friends: cloudRes.data.friends || friends,
          meetups: cloudRes.data.meetups || meetups,
        });

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        // First-time Google login: Link current local data and upload to Cloud
        const linkedProfile: UserProfile = {
          ...currentProfile,
          googleEmail: gUser.email || undefined,
          googleUid: gUser.uid,
          name: currentProfile.name || gUser.displayName || 'Google 吃貨',
          avatar: currentProfile.avatar?.startsWith('data:') ? currentProfile.avatar : (gUser.photoURL || currentProfile.avatar),
        };

        registerOrUpdateAccount(linkedProfile, restaurants, friends, meetups);
        await syncDataToCloud(gUser.uid, {
          profile: linkedProfile,
          restaurants,
          friends,
          meetups,
          friendRequests: [],
        });

        onLoginSuccess({
          foodieId: linkedProfile.foodieId,
          pinCode: linkedProfile.pinCode,
          profile: linkedProfile,
          restaurants,
          friends,
          meetups,
        });

        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error('Google Auth Error', err);
      setStatusMessage({ type: 'error', text: 'Google 登入失敗，請檢查網路或稍後再試！' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const savedAccounts = Object.values(loadAccountRegistry());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                {lang === 'zh-TW' ? '吃貨帳號登入 & 跨裝置綁定' : 'アカウントログイン・連携'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🔵 Google 1-Click Account Link & Cloud Sync */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-rose-50/60 border-b border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">☁️</span>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  Google 帳號一鍵無痛轉移
                </h4>
                <p className="text-[10px] text-slate-500">
                  跨手機、跨電腦免手動匯出，登入自動雲端即時同步
                </p>
              </div>
            </div>
            {currentProfile.googleEmail ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>已綁定</span>
              </span>
            ) : null}
          </div>

          {currentProfile.googleEmail ? (
            <div className="bg-white/80 p-2.5 rounded-2xl border border-indigo-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs truncate">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="font-bold text-slate-800 truncate">{currentProfile.googleEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-xs shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                {isGoogleLoading ? '同步中...' : '☁️ 立即同步'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-black text-xs border border-slate-300/80 shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer hover:border-indigo-400 group"
            >
              <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isGoogleLoading ? '連線登入中...' : '使用 Google 帳號一鍵登入 / 跨裝置移轉'}</span>
            </button>
          )}
        </div>

        {/* Current Active Account Indicator */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0 shadow-2xs border border-amber-300">
              {currentProfile.avatar?.startsWith('data:') || currentProfile.avatar?.startsWith('http') ? (
                <img src={currentProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs">{currentProfile.avatar || '🥢'}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-amber-900 block font-bold">目前裝置登入身份：</span>
              <span className="font-black text-slate-900">{currentProfile.name} ({currentProfile.foodieId}#{currentProfile.pinCode})</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-0.5">
            <Check className="w-3 h-3" />
            <span>已登入</span>
          </span>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
            className={`flex-1 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🔑 登入吃貨帳號
          </button>

          <button
            onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
            className={`flex-1 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📝 註冊綁定新 ID
          </button>
        </div>

        <div className="p-5 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    吃貨 ID (帳號)：
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：kaw_foodie 或 annie_sweets"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    4 碼安全 PIN 碼 (密碼)：
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="•••• (若未設定可留空)"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 tracking-widest font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>🔐 驗證並登入此吃貨帳號</span>
                </button>
              </form>

              {/* ⚡ 1-Click Quick Login to Saved Accounts on this Device */}
              {savedAccounts.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 block">
                    ⚡ 本機已儲存帳號（點擊直接切換）：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {savedAccounts.map((acc) => (
                      <button
                        key={acc.foodieId}
                        type="button"
                        onClick={() => {
                          const res = authenticateAndLoginAccount(acc.foodieId, acc.pinCode);
                          if (res.success && res.account) {
                            setStatusMessage({ type: 'success', text: res.message });
                            setTimeout(() => {
                              onLoginSuccess(res.account!);
                              onClose();
                            }, 500);
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <span>{acc.profile.avatar || '🥢'}</span>
                        <span>{acc.profile.name}</span>
                        <span className="text-[10px] font-mono opacity-60">({acc.foodieId})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  自訂專屬吃貨 ID (英數字/底線) *：
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：my_foodie_name"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  自訂 4 碼安全 PIN 密碼 (僅數字) *：
                </label>
                <input
                  type="password"
                  required
                  maxLength={10}
                  placeholder="例如：9527 或 8888"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono font-black tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  您的吃貨暱稱：
                </label>
                <input
                  type="text"
                  placeholder="例如：拉麵達人 Ken"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="p-2.5 bg-purple-50 rounded-2xl text-[11px] text-purple-950 border border-purple-200 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>防冒用保護機制：</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  註冊後，此吃貨 ID 將與您的安全 PIN 密碼鎖定綁定，其他裝置無法隨意使用您的 ID 除非輸入正確的 PIN 碼！
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>🚀 註冊並立即綁定此吃貨 ID</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
