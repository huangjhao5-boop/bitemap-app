import React, { useState } from 'react';
import type { UserProfile, Restaurant, Friend, DiningMeetup } from '../../types';
import type { Language } from '../../utils/i18n';
import { 
  authenticateAndLoginAccount, 
  registerOrUpdateAccount, 
  loadAccountRegistry,
} from '../../utils/storage';
import type { AccountRecord } from '../../utils/storage';
import { 
  X, 
  KeyRound, 
  Sparkles, 
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

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginId.trim().toLowerCase();
    const pin = loginPin.trim();

    if (!id || pin.length !== 4) {
      setStatusMessage({ type: 'error', text: '請輸入有效的吃貨 ID 與 4 碼 PIN 密碼！' });
      return;
    }

    const res = authenticateAndLoginAccount(id, pin);
    if (res.success && res.account) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        onLoginSuccess(res.account!);
        onClose();
      }, 700);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = regId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const pin = regPin.trim();
    const name = regName.trim();

    if (!id || id.length < 3) {
      setStatusMessage({ type: 'error', text: '吃貨 ID 至少需要 3 個英數字或底線！' });
      return;
    }

    if (pin.length !== 4) {
      setStatusMessage({ type: 'error', text: '安全認證密碼必須是 4 位數字！' });
      return;
    }

    const registry = loadAccountRegistry();
    if (registry[id]) {
      setStatusMessage({ type: 'error', text: `吃貨 ID【${id}】已經被註冊綁定！若這是您的帳號請直接登入。` });
      return;
    }

    const newProfile: UserProfile = {
      ...currentProfile,
      foodieId: id,
      pinCode: pin,
      name: name || currentProfile.name,
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
    }, 800);
  };

  const quickSwitchDemo = (demoId: string, demoPin: string) => {
    setLoginId(demoId);
    setLoginPin(demoPin);
    setStatusMessage(null);
  };

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
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Indicator */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentProfile.avatar || '🥢'}</span>
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
            className={`flex-1 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'login'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🔑 登入吃貨帳號
          </button>

          <button
            onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
            className={`flex-1 py-2 rounded-2xl text-xs font-black transition-all ${
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
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  吃貨 ID (帳號)：
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：kaw_foodie 或 annie_sweets"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toLowerCase().trim())}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  4 位數安全認證 PIN 密碼：
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="4 碼數字（例如：8888）"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono font-black tracking-widest"
                />
              </div>

              {/* Demo Quick Logins */}
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px]">
                <span className="text-slate-500 font-bold block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>點擊快速切換測試帳號：</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'kaw_foodie', pin: '8888', name: '🥢 Kevin' },
                    { id: 'annie_sweets', pin: '1234', name: '🍮 安妮' },
                    { id: 'ming_ramen', pin: '0000', name: '🍜 小明' },
                    { id: 'kevin_meat', pin: '6666', name: '🥩 凱文' },
                  ].map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => quickSwitchDemo(demo.id, demo.pin)}
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 font-medium border border-slate-200 transition-colors"
                    >
                      {demo.name} ({demo.id})
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>🔐 驗證並登入此吃貨帳號</span>
              </button>
            </form>
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
                  onChange={(e) => setRegId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
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
                  maxLength={4}
                  placeholder="例如：9527 或 7788"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, ''))}
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
                  註冊後，此吃貨 ID 將與您的 4 碼 PIN 碼永久鎖定綁定，其他裝置無法隨意使用您的 ID 除非輸入正確的 PIN 碼！
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
