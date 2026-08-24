import React, { useState, useEffect } from 'react';
import type { Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { X, Heart, AlertOctagon } from 'lucide-react';

interface FriendTasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (friend: Friend) => void;
  editingFriend?: Friend | null;
  lang: Language;
}

const COMMON_FAVORITES_ZH = ['日式拉麵', '和牛燒肉', '麻辣火鍋', '手沖咖啡', '甜點蛋糕', '義大利麵', '早午餐', '居酒屋串燒', '泰式料理', '平價小吃'];
const COMMON_DISLIKES_ZH = ['不吃香菜', '怕辣 / 完全不吃辣', '生魚片 / 生食', '乳糖不耐', '不吃牛肉', '不吃海鮮', '素食主義', '太甜', '油膩重口味', '內臟類'];

const COMMON_FAVORITES_JA = ['ラーメン', '和牛焼肉', '麻辣火鍋', 'ハンドドリップ珈琲', 'スイーツ・ケーキ', 'パスタ', 'ブランチ', '焼き鳥居酒屋', 'タイ料理', '町中華'];
const COMMON_DISLIKES_JA = ['パクチー不可', '激辛NG・辛いもの苦手', '生魚・刺身NG', '乳糖不耐症', '牛肉NG', '海鮮アレルギー', 'ベジタリアン', '甘すぎるもの', '脂っこいもの', 'ホルモン・内臓系'];

const EMOJI_AVATARS = ['🍜', '🍰', '🥩', '🥗', '🍣', '🍔', '🍺', '🥑', '🍕', '🍢', '🍩', '🥐', '🍦', '🍷'];

export const FriendTasteModal: React.FC<FriendTasteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFriend,
  lang,
}) => {
  const t = translations[lang];
  const COMMON_FAVORITES = lang === 'zh-TW' ? COMMON_FAVORITES_ZH : COMMON_FAVORITES_JA;
  const COMMON_DISLIKES = lang === 'zh-TW' ? COMMON_DISLIKES_ZH : COMMON_DISLIKES_JA;

  const [foodieId, setFoodieId] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🍜');
  const [favoriteTags, setFavoriteTags] = useState<string[]>([]);
  const [newFavInput, setNewFavInput] = useState('');
  const [dislikedTags, setDislikedTags] = useState<string[]>([]);
  const [newDislikeInput, setNewDislikeInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingFriend) {
      setFoodieId(editingFriend.foodieId || '');
      setName(editingFriend.name);
      setAvatar(editingFriend.avatar);
      setFavoriteTags(editingFriend.favoriteTags || []);
      setDislikedTags(editingFriend.dislikedTags || []);
      setNotes(editingFriend.notes || '');
    } else {
      setFoodieId('');
      setName('');
      setAvatar('🍜');
      setFavoriteTags(lang === 'zh-TW' ? ['拉麵', '燒肉'] : ['ラーメン', '焼肉']);
      setDislikedTags(lang === 'zh-TW' ? ['不吃香菜'] : ['パクチー不可']);
      setNotes('');
    }
  }, [editingFriend, isOpen, lang]);

  const handleAddFavorite = (tagToAdd?: string) => {
    const val = tagToAdd || newFavInput.trim();
    if (!val || favoriteTags.includes(val)) return;
    setFavoriteTags([...favoriteTags, val]);
    if (!tagToAdd) setNewFavInput('');
  };

  const handleRemoveFavorite = (tag: string) => {
    setFavoriteTags(favoriteTags.filter((t) => t !== tag));
  };

  const handleAddDislike = (tagToAdd?: string) => {
    const val = tagToAdd || newDislikeInput.trim();
    if (!val || dislikedTags.includes(val)) return;
    setDislikedTags([...dislikedTags, val]);
    if (!tagToAdd) setNewDislikeInput('');
  };

  const handleRemoveDislike = (tag: string) => {
    setDislikedTags(dislikedTags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(lang === 'zh-TW' ? '請填寫朋友暱稱！' : 'ニックネームを入力してください！');
      return;
    }

    const friendData: Friend = {
      id: editingFriend ? editingFriend.id : 'f_' + Date.now(),
      foodieId: foodieId.trim() || undefined,
      name: name.trim(),
      avatar,
      favoriteTags,
      dislikedTags,
      notes: notes.trim(),
    };


    onSave(friendData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{avatar}</span>
            <h2 className="text-lg font-bold text-white">
              {editingFriend ? t.modalEditFriend : t.modalAddFriend}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.labelAvatarEmoji}
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_AVATARS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setAvatar(emo)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    avatar === emo
                      ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-300 scale-110'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.labelFriendName}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'zh-TW' ? '例如：小明 (拉麵狂人)' : '例：田中 (ラーメン部)'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>{t.labelFriendLikes}</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'zh-TW' ? '輸入喜歡的美食，例如：厚切牛舌、巴斯克乳酪' : '好きなメニュー、例：厚切り牛タン、バスクチーズケーキ'}
                value={newFavInput}
                onChange={(e) => setNewFavInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFavorite();
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-emerald-50/40"
              />
              <button
                type="button"
                onClick={() => handleAddFavorite()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {t.btnAdd}
              </button>
            </div>

            <div className="flex flex-wrap gap-1 items-center pt-1">
              <span className="text-[10px] text-slate-400 font-medium mr-1">{t.labelQuickAdd}</span>
              {COMMON_FAVORITES.map((fav) => (
                <button
                  key={fav}
                  type="button"
                  onClick={() => handleAddFavorite(fav)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors"
                >
                  + {fav}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {favoriteTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(tag)}
                    className="text-emerald-700 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>{t.labelFriendDislikes}</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'zh-TW' ? '輸入忌口或討厭食物，例如：不吃香菜、乳糖不耐' : '苦手な食材、例：パクチー、辛すぎるもの'}
                value={newDislikeInput}
                onChange={(e) => setNewDislikeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDislike();
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-rose-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-rose-50/40"
              />
              <button
                type="button"
                onClick={() => handleAddDislike()}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {t.btnAdd}
              </button>
            </div>

            <div className="flex flex-wrap gap-1 items-center pt-1">
              <span className="text-[10px] text-slate-400 font-medium mr-1">{t.labelQuickAdd}</span>
              {COMMON_DISLIKES.map((dis) => (
                <button
                  key={dis}
                  type="button"
                  onClick={() => handleAddDislike(dis)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors"
                >
                  + {dis}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {dislikedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-rose-100 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-200"
                >
                  <span>⚠️ {tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDislike(tag)}
                    className="text-rose-700 hover:text-rose-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.labelFriendNotes}
            </label>
            <textarea
              rows={2}
              placeholder={lang === 'zh-TW' ? '例如：每次聚餐都要喝一杯生啤酒、不能吃太晚...' : '例：生ビール好き、遅い時間はNGなど...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </form>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {t.btnCancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 transition-all active:scale-95"
          >
            {editingFriend ? t.btnSave : t.btnAdd}
          </button>
        </div>
      </div>
    </div>
  );
};
