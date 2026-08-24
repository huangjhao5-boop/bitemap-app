import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  X, 
  User, 
  Camera, 
  MapPin, 
  Check, 
  Heart, 
  AlertOctagon, 
  Flame, 
  DollarSign, 
  Coffee, 
  Plus 
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  lang: Language;
}

const EMOJI_AVATARS = ['🥢', '🍜', '🍣', '🥩', '🍰', '🍔', '🥑', '🍕', '🍻', '☕', '🍢', '🍩', '🥐', '🍦'];

const COMMON_FAVORITES = ['日式拉麵', '和牛燒肉', '手沖咖啡', '巴斯克乳酪', '麻辣火鍋', '義大利麵', '早午餐', '居酒屋串燒', '泰式料理', '在地小吃'];
const COMMON_DISLIKES = ['不吃香菜', '怕辣 / 完全不吃辣', '生魚片 / 生食NG', '乳糖不耐', '不吃牛肉', '海鮮過敏', '素食主義', '太甜死甜', '油膩重口味', '內臟類'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  lang,
}) => {
  const t = translations[lang];

  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [bio, setBio] = useState(profile.bio);
  const [defaultCity, setDefaultCity] = useState(profile.defaultCity);
  const [instagramHandle, setInstagramHandle] = useState(profile.instagramHandle || '');

  // Rich Dietary & Taste preferences
  const [favoriteTags, setFavoriteTags] = useState<string[]>(profile.favoriteTags || []);
  const [newFavInput, setNewFavInput] = useState('');

  const [dislikedTags, setDislikedTags] = useState<string[]>(profile.dislikedTags || []);
  const [newDislikeInput, setNewDislikeInput] = useState('');

  const [spicinessLevel, setSpicinessLevel] = useState<UserProfile['spicinessLevel']>(profile.spicinessLevel || 'mild');
  const [budgetPreference, setBudgetPreference] = useState<UserProfile['budgetPreference']>(profile.budgetPreference || '$$');
  const [favoriteDrink, setFavoriteDrink] = useState(profile.favoriteDrink || '');

  useEffect(() => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setBio(profile.bio);
    setDefaultCity(profile.defaultCity);
    setInstagramHandle(profile.instagramHandle || '');
    setFavoriteTags(profile.favoriteTags || []);
    setDislikedTags(profile.dislikedTags || []);
    setSpicinessLevel(profile.spicinessLevel || 'mild');
    setBudgetPreference(profile.budgetPreference || '$$');
    setFavoriteDrink(profile.favoriteDrink || '');
  }, [profile, isOpen]);

  if (!isOpen) return null;

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
      alert(lang === 'zh-TW' ? '請填寫您的暱稱！' : 'ニックネームを入力してください！');
      return;
    }

    onSaveProfile({
      name: name.trim(),
      avatar,
      bio: bio.trim(),
      defaultCity,
      instagramHandle: instagramHandle.trim(),
      favoriteTags,
      dislikedTags,
      spicinessLevel,
      budgetPreference,
      favoriteDrink: favoriteDrink.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              {lang === 'zh-TW' ? '👤 個人吃貨檔案與口味設定' : '👤 プロフィール＆味覚設定'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Avatar & Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>🆔</span> {lang === 'zh-TW' ? '基本資料' : '基本情報'}
            </h3>

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {lang === 'zh-TW' ? '選擇您的吃貨代表頭像' : 'プロフィールアイコン'}
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_AVATARS.map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setAvatar(emo)}
                    className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border transition-all ${
                      avatar === emo
                        ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-300 scale-110 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'zh-TW' ? '您的吃貨暱稱 *' : 'ニックネーム *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'zh-TW' ? '例如：吃貨探險家 Kevin' : '例：グルメ探検家 田中'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
                />
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-pink-600" />
                  <span>{lang === 'zh-TW' ? 'Instagram 帳號 (將顯示在小卡上)' : 'Instagram アカウント'}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
                  <input
                    type="text"
                    placeholder="kevin_foodie_daily"
                    value={instagramHandle.replace(/^@/, '')}
                    onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                    className="w-full text-sm pl-7 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-pink-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Default City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{lang === 'zh-TW' ? '常駐探索城市' : 'デフォルト地域'}</span>
                </label>
                <select
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="台北市">台北市</option>
                  <option value="新北市">新北市</option>
                  <option value="台中市">台中市</option>
                  <option value="台南市">台南市</option>
                  <option value="高雄市">高雄市</option>
                  <option value="東京">東京</option>
                  <option value="大阪">大阪</option>
                  <option value="京都">京都</option>
                  <option value="福岡">福岡</option>
                  <option value="其他">其他 / その他</option>
                </select>
              </div>

              {/* Favorite Drink */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'zh-TW' ? '聚餐必點飲品 / 咖啡偏好' : '定番ドリンク / 珈琲'}</span>
                </label>
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '例如：無糖冰美式、生啤酒、微糖微冰' : '例：アイスアメリカーノ、生ビール'}
                  value={favoriteDrink}
                  onChange={(e) => setFavoriteDrink(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Personal Taste & Dietary Dislikes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>🍽️</span> {lang === 'zh-TW' ? '個人愛好與飲食忌口（盲盒與聚餐快選時自動避雷）' : '好み・NG食材（自動回避用）'}
            </h3>

            {/* Spiciness & Budget Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{lang === 'zh-TW' ? '個人吃辣承受度：' : '辛さ耐性：'}</span>
                </label>
                <select
                  value={spicinessLevel}
                  onChange={(e) => setSpicinessLevel(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="none">👶 完全不吃辣 (0辛)</option>
                  <option value="mild">🌶️ 微辣 (小辣即可)</option>
                  <option value="medium">🌶️🌶️ 中辣 (麻辣鍋愛好者)</option>
                  <option value="hot">🔥🔥 大辣 / 重度嗜辣</option>
                  <option value="insane">☠️ 地獄狂辣魔人</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'zh-TW' ? '常用預算偏好：' : '予算傾向：'}</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700">
                    {budgetPreference === '$' && '< $200 (平價小吃)'}
                    {budgetPreference === '$$' && '$200 ~ $500 (日常拉麵/聚餐)'}
                    {budgetPreference === '$$$' && '$500 ~ $1,500 (精緻火鍋/居酒屋)'}
                    {budgetPreference === '$$$$' && '$1,500+ (頂級割烹/和牛)'}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { lvl: '$' as const, label: '< $200' },
                    { lvl: '$$' as const, label: '$200-500' },
                    { lvl: '$$$' as const, label: '$500-1.5k' },
                    { lvl: '$$$$' as const, label: '$1.5k+' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => setBudgetPreference(item.lvl)}
                      className={`py-1.5 px-1 rounded-xl text-center border transition-all ${
                        budgetPreference === item.lvl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-black text-xs">{item.lvl}</div>
                      <div className="text-[9px] opacity-80">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>


            {/* Favorite Foods */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>{lang === 'zh-TW' ? '您最愛的美食類別 / 招牌餐點：' : '好きなグルメジャンル：'}</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '輸入愛吃的類別，例如：日式拉麵、和牛燒肉' : '好きなメニュー、例：ラーメン、焼肉'}
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
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1 items-center pt-0.5">
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

            {/* Disliked Foods / Dietary restrictions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>{lang === 'zh-TW' ? '您的個人飲食忌口 / 絕對不吃食材 (抽盲盒時會自動排除！)：' : 'NG食材・アレルギー（盲盒から自動除外）：'}</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '輸入忌口，例如：不吃香菜、生魚片NG、乳糖不耐' : '苦手な食材、例：パクチー、辛いもの'}
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
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1 items-center pt-0.5">
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
          </div>

          {/* Section 3: Bio */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'zh-TW' ? '美食座右銘 / 個人簡介' : 'グルメモットー'}
            </label>
            <textarea
              rows={2}
              placeholder={lang === 'zh-TW' ? '例如：無辣不歡、甜點是第二個胃，熱愛踩點短影音爆紅店！' : '例：ラーメンとスイーツ巡りが趣味。SNS話題店を記録中！'}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 leading-relaxed"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {lang === 'zh-TW' ? '🟢 資料將自動同步雲端' : '🟢 クラウド自動同期有効'}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {t.btnCancel}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>{t.btnSave}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
