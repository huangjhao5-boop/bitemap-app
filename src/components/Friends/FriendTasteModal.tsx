import React, { useState, useEffect } from 'react';
import type { Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { X, Heart, AlertOctagon, Sparkles, BookOpen, ShieldCheck, Plus } from 'lucide-react';

interface FriendTasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (friend: Friend) => void;
  editingFriend?: Friend | null;
  lang: Language;
}

const COMMON_FAVORITES_ZH = ['日式拉麵', '和牛燒肉', '麻辣火鍋', '手沖咖啡', '甜點蛋糕', '義大利麵', '早午餐', '居酒屋串燒', '泰式料理', '平價小吃'];
const COMMON_DISLIKES_ZH = ['不吃香菜', '怕辣 / 完全不吃辣', '生魚片 / 生食', '乳糖不耐', '不吃牛肉', '不吃海鮮', '素食主義', '太甜', '油膩重口味', '內臟類'];

const EMOJI_AVATARS = ['🍜', '🍰', '🥩', '🥗', '🍣', '🍔', '🍺', '🥑', '🍕', '🍢', '🍩', '🥐', '🍦', '🍷'];

export const FriendTasteModal: React.FC<FriendTasteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFriend,
  lang,
}) => {
  const t = translations[lang];

  // ☁️ Cloud Profile (From Friend - Readonly or manual friend fallback)
  const [foodieId, setFoodieId] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🍜');
  const [cloudFavorites, setCloudFavorites] = useState<string[]>([]);
  const [cloudDislikes, setCloudDislikes] = useState<string[]>([]);

  // 📝 My Personal Observation (Isolated - Local only!)
  const [customNickname, setCustomNickname] = useState('');
  const [myObservedFavorites, setMyObservedFavorites] = useState<string[]>([]);
  const [newObservedFavInput, setNewObservedFavInput] = useState('');
  const [myObservedDislikes, setMyObservedDislikes] = useState<string[]>([]);
  const [newObservedDislikeInput, setNewObservedDislikeInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingFriend) {
      setFoodieId(editingFriend.foodieId || '');
      setName(editingFriend.name || '');
      setAvatar(editingFriend.avatar || '🍜');
      setCloudFavorites(editingFriend.favoriteTags || []);
      setCloudDislikes(editingFriend.dislikedTags || []);

      setCustomNickname(editingFriend.customNickname || '');
      setMyObservedFavorites(editingFriend.myObservedFavorites || []);
      setMyObservedDislikes(editingFriend.myObservedDislikes || []);
      setNotes(editingFriend.notes || '');
    } else {
      setFoodieId('');
      setName('');
      setAvatar('🍜');
      setCloudFavorites(['日式拉麵', '和牛燒肉']);
      setCloudDislikes(['不吃香菜']);

      setCustomNickname('');
      setMyObservedFavorites([]);
      setMyObservedDislikes([]);
      setNotes('');
    }
  }, [editingFriend, isOpen]);

  if (!isOpen) return null;

  const handleAddObservedFavorite = (tagToAdd?: string) => {
    const val = tagToAdd || newObservedFavInput.trim();
    if (!val || myObservedFavorites.includes(val)) return;
    setMyObservedFavorites([...myObservedFavorites, val]);
    if (!tagToAdd) setNewObservedFavInput('');
  };

  const handleRemoveObservedFavorite = (tag: string) => {
    setMyObservedFavorites(myObservedFavorites.filter((t) => t !== tag));
  };

  const handleAddObservedDislike = (tagToAdd?: string) => {
    const val = tagToAdd || newObservedDislikeInput.trim();
    if (!val || myObservedDislikes.includes(val)) return;
    setMyObservedDislikes([...myObservedDislikes, val]);
    if (!tagToAdd) setNewObservedDislikeInput('');
  };

  const handleRemoveObservedDislike = (tag: string) => {
    setMyObservedDislikes(myObservedDislikes.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !customNickname.trim()) {
      alert('請填寫好友名稱或專屬備註！');
      return;
    }

    const friendData: Friend = {
      id: editingFriend ? editingFriend.id : 'f_' + Date.now(),
      foodieId: foodieId.trim() || undefined,
      name: name.trim() || customNickname.trim(),
      avatar,
      favoriteTags: cloudFavorites,
      dislikedTags: cloudDislikes,

      // 📝 Isolated Observations (Preserved locally, never overwritten by cloud)
      customNickname: customNickname.trim() || undefined,
      myObservedFavorites,
      myObservedDislikes,
      notes: notes.trim(),
    };

    onSave(friendData);
    onClose();
  };

  const isCloudBound = Boolean(foodieId && foodieId !== 'guest');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 m-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white/20 shrink-0 border border-white/30 shadow-xs">
              {avatar && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.length > 20) ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{avatar || '🥢'}</span>
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>{customNickname ? `${customNickname} (${name})` : name || '好友資料與觀察手冊'}</span>
              </h2>
              <p className="text-[10px] text-purple-200">
                {isCloudBound ? `🪪 雲端已綁定 @${foodieId}` : '📝 手動自建備忘名冊'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: ☁️ 对方的公开自订资料 (云端同步) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span className="text-sm">☁️</span> 好友公開自訂資料 {isCloudBound && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">雲端即時同步</span>}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">公開暱稱</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCloudBound}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 disabled:bg-slate-100/70"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">吃貨 ID</label>
                <input
                  type="text"
                  value={foodieId || '手動建立'}
                  disabled
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100/70 font-mono font-bold text-purple-700"
                />
              </div>
            </div>

            {/* Cloud Favorite Tags */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <Heart className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                <span>對方公開喜好 ({cloudFavorites.length})</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {cloudFavorites.length === 0 ? (
                  <span className="text-[10px] text-slate-400">尚無填寫</span>
                ) : (
                  cloudFavorites.map((tag, i) => (
                    <span key={i} className="text-[11px] font-medium bg-white text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Cloud Disliked Tags */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-rose-500" />
                <span>對方公開忌口 ({cloudDislikes.length})</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {cloudDislikes.length === 0 ? (
                  <span className="text-[10px] text-slate-400">尚無填寫</span>
                ) : (
                  cloudDislikes.map((tag, i) => (
                    <span key={i} className="text-[11px] font-medium bg-white text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200 line-through">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section 2: 📝 我個人的私房觀察與專屬備忘 (完全隔離、本機專屬、絕不衝突！) */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border-2 border-purple-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <span className="text-sm">📝</span> 我對好友的私房觀察與備忘
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                本機專屬 · 絕不覆蓋
              </span>
            </div>

            {/* Custom Nickname */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                📌 我的專屬備註暱稱 / 外號（例：老弟、拉麵狂魔小王）
              </label>
              <input
                type="text"
                placeholder={name ? `自訂備註（留空則顯示對方原名「${name}」）` : '輸入好友備註'}
                value={customNickname}
                onChange={(e) => setCustomNickname(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-purple-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white font-bold text-slate-900"
              />
            </div>

            {/* My Observed Favorites */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>我觀察到的愛吃偏好（每次聚餐選店自動納入計算）</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="輸入我觀察到的喜好，例：厚切牛舌、超愛冰美式"
                  value={newObservedFavInput}
                  onChange={(e) => setNewObservedFavInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObservedFavorite();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddObservedFavorite()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-0.5" /> 新增
                </button>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {myObservedFavorites.map((tag) => (
                  <span
                    key={tag}
                    className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200"
                  >
                    <span>📝 {tag}</span>
                    <button type="button" onClick={() => handleRemoveObservedFavorite(tag)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* My Observed Dislikes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rose-900 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>我觀察到的忌口避雷（聚餐自動嚴格避雷）</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="輸入我觀察到的忌口，例：不能吃花生、甲殼類微過敏"
                  value={newObservedDislikeInput}
                  onChange={(e) => setNewObservedDislikeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObservedDislike();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-rose-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddObservedDislike()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-0.5" /> 新增
                </button>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {myObservedDislikes.map((tag) => (
                  <span
                    key={tag}
                    className="bg-rose-100 text-rose-900 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-rose-200"
                  >
                    <span>🚫 {tag}</span>
                    <button type="button" onClick={() => handleRemoveObservedDislike(tag)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                📝 私房備忘筆記
              </label>
              <textarea
                rows={2}
                placeholder="記錄他的聚餐習慣、常喝的飲料或特別紀念日..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-purple-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
            >
              {t.btnSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
