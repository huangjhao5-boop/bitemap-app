import React, { useState } from 'react';
import type { UserProfile, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { generateFriendInviteToken } from '../../utils/storage';
import { 
  X, 
  Copy, 
  Check, 
  UserPlus, 
  ShieldCheck, 
  Sparkles, 
  Search,
  Send
} from 'lucide-react';


interface FriendIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  friends: Friend[];
  lang: Language;
  onSendFriendRequest: (targetFoodieIdOrToken: string) => { success: boolean; message: string };
}

export const FriendIdModal: React.FC<FriendIdModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  lang,
  onSendFriendRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'my_id' | 'add_by_id'>('my_id');
  const [inputCode, setInputCode] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const inviteToken = generateFriendInviteToken(userProfile);
  const currentBaseUrl = window.location.origin + window.location.pathname;
  const inviteUrl = `${currentBaseUrl}#add-friend=${inviteToken}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userProfile.foodieId || 'FOODIE-9527');
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLineShareId = () => {
    let msg = `🥢 【加我為 BiteMap 吃貨好友！】
`;
    msg += `🪪 我的吃貨 ID：${userProfile.foodieId || 'FOODIE-9527'}
`;
    msg += `👤 名稱：${userProfile.name}
`;
    msg += `❤️ 喜愛美食：${userProfile.favoriteTags.join('、')}
`;
    if (userProfile.dislikedTags.length > 0) {
      msg += `⚠️ 飲食忌口：${userProfile.dislikedTags.join('、')}
`;
    }
    msg += `
🔗 點擊連結一鍵發送好友申請：
${inviteUrl}
`;
    msg += `— 來自 BiteMap 短影音美食地圖`;

    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = onSendFriendRequest(inputCode.trim());
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setInputCode('');
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black text-white">
              {lang === 'zh-TW' ? '🪪 吃貨 ID 綁定與好友邀請' : '🪪 グルメID連携＆フレンド招待'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => { setActiveTab('my_id'); setStatusMessage(null); }}
            className={`flex-1 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'my_id'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🪪 我的吃貨名片 & ID
          </button>

          <button
            onClick={() => { setActiveTab('add_by_id'); setStatusMessage(null); }}
            className={`flex-1 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'add_by_id'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ➕ 輸入 ID 申請加好友
          </button>
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'my_id' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Foodie Identity Card */}
              <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{userProfile.avatar || '🥢'}</span>
                    <div>
                      <h3 className="font-black text-base text-white">{userProfile.name}</h3>
                      <p className="text-[10px] text-amber-400 font-mono font-bold tracking-wider">
                        {userProfile.foodieId || 'FOODIE-9527'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black">
                    認證吃貨身份
                  </span>
                </div>

                {/* Taste badges */}
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {userProfile.favoriteTags.map((tag, i) => (
                      <span key={i} className="bg-white/10 px-2 py-0.5 rounded-lg text-white font-medium text-[10px]">
                        ❤️ {tag}
                      </span>
                    ))}
                    {userProfile.dislikedTags.map((tag, i) => (
                      <span key={i} className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg font-medium text-[10px] line-through">
                        ⚠️ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>互加好友後，自動同步彼此喜好與忌口！</span>
                  <span className="font-mono">#BiteMapID</span>
                </div>
              </div>

              {/* ID & Link Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleCopyId}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
                  <span>{copiedId ? '已複製 ID：' + (userProfile.foodieId || 'FOODIE-9527') : '📋 複製我的吃貨 ID'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
                  <span>{copiedLink ? '已複製加友專屬連結！' : '🔗 複製加友專屬連結'}</span>
                </button>
              </div>

              {/* LINE Share Button */}
              <button
                onClick={handleLineShareId}
                className="w-full py-3 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>💬 發送吃貨名片至 LINE 邀請好友綁定</span>
              </button>
            </div>
          )}

          {activeTab === 'add_by_id' && (
            <form onSubmit={handleAddSubmit} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  輸入對方的 吃貨 ID 或 貼上邀請碼：
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="例如：FOODIE-8842 或貼上邀請碼/連結"
                    value={inputCode}
                    onChange={(e) => { setInputCode(e.target.value); setStatusMessage(null); }}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/80 text-[11px] text-purple-950 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>綁定流程說明：</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  輸入 ID 發送申請後，對方會在「待審核好友邀請」中收到您的吃貨名片與口味偏好。對方點擊「同意」後，雙方即刻互相綁定並同步忌口雷區！
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>🚀 發送好友申請</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
