import React, { useState, useRef } from 'react';
import type { UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  X, 
  Check, 
  Flame, 
  DollarSign, 
  Sparkles, 
  User, 
  MapPin, 
  Camera, 
  Plus, 
  Trash2,
  Coffee
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  lang: Language;
}

const EMOJI_AVATARS = ['🥢', '🍜', '🥩', '🍰', '🍣', '🍕', '🍔', '🍺', '☕', '🥑', '🥟', '🍤'];
const POPULAR_FAV_TAGS = ['日式拉麵', '和牛燒肉', '手沖咖啡', '巴斯克乳酪', '生魚片壽司', '麻辣火鍋', '炭烤牛排', '韓式炸雞'];
const POPULAR_DISLIKE_TAGS = ['不吃香菜', '怕辣', '不吃牛', '不吃羊', '乳糖不耐', '不吃生食', '討厭內臟', '少油低卡'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  lang,
}) => {
  const t = translations[lang];

  const [foodieId, setFoodieId] = useState(profile.foodieId || 'kaw_foodie');
  const [pinCode, setPinCode] = useState(profile.pinCode || '8888');
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
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 400; // Perfect high-res square avatar
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Crop center square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, SIZE, SIZE);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddFavorite = (tagToAdd?: string) => {
    const val = (tagToAdd || newFavInput).trim();
    if (!val || favoriteTags.includes(val)) return;
    setFavoriteTags([...favoriteTags, val]);
    if (!tagToAdd) setNewFavInput('');
  };

  const handleRemoveFavorite = (tag: string) => {
    setFavoriteTags(favoriteTags.filter((t) => t !== tag));
  };

  const handleAddDislike = (tagToAdd?: string) => {
    const val = (tagToAdd || newDislikeInput).trim();
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
      foodieId: foodieId.trim() || 'kaw_foodie',
      pinCode: pinCode.trim() || '8888',
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
          {/* 🔐 Section 0: Custom Foodie ID & 4-Digit Security PIN */}
          <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-4 rounded-3xl border border-amber-300/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪪</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {lang === 'zh-TW' ? '自訂吃貨 ID & 4 碼安全認證碼' : 'カスタムグルメID & 4桁暗証番号'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {lang === 'zh-TW' ? '個人永久帳號，換手機或清除紀錄時可憑 ID 與 4 碼直接登入還原！' : '端末変更やデータ復元用の固有IDと暗証番号'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-mono font-black text-[10px] shadow-2xs">
                {foodieId}#{pinCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  {lang === 'zh-TW' ? '自訂個人吃貨 ID (英數帳號) *' : 'カスタムID *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：kaw_foodie 或 tokyo_ramen"
                  value={foodieId}
                  onChange={(e) => setFoodieId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  {lang === 'zh-TW' ? '自訂 4 碼安全認證碼 (PIN) *' : '4桁の暗証番号 (PIN) *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="例如：8888 或 1234"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono font-black tracking-widest bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Avatar & Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>🆔</span> {lang === 'zh-TW' ? '基本資料' : '基本情報'}
            </h3>

            {/* 📷 Avatar Picker & Custom Photo Uploader */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
              <label className="block text-xs font-black text-slate-800">
                {lang === 'zh-TW' ? '📷 個人專屬頭像 (可上傳個人照片或自選 Emoji)' : '📷 プロフィール写真・アイコン'}
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Large Avatar Preview with Upload Trigger */}
                <div className="relative group cursor-pointer" onClick={() => avatarFileInputRef.current?.click()}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2.5px] shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                      {avatar?.startsWith('data:') || avatar?.startsWith('http') ? (
                        <img src={avatar} alt="頭像" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{avatar || '🥢'}</span>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-rose-500 text-white shadow-md border-2 border-white">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Upload Buttons & Emoji Selector */}
                <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{avatar?.startsWith('data:') ? '更換照片頭貼' : '上傳我的照片'}</span>
                    </button>

                    {avatar?.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setAvatar('🥢')}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        恢復預設 Emoji
                      </button>
                    )}
                  </div>

                  {/* Quick Emoji Avatar Selector */}
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                    {EMOJI_AVATARS.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setAvatar(emo)}
                        className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border transition-all cursor-pointer ${
                          avatar === emo
                            ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-300 scale-110 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                        title={emo}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hidden Avatar File Input */}
              <input
                type="file"
                ref={avatarFileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
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
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === 'zh-TW' ? '預設常住城市' : '主要活動エリア'}</span>
                </label>
                <select
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
                </select>
              </div>

              {/* Favorite Drink */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'zh-TW' ? '本命愛喝飲品' : '定番ドリンク'}</span>
                </label>
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '例如：無糖冰美式 / 熟成蜜香紅茶' : '例：アイスアメリカーノ / 抹茶ラテ'}
                  value={favoriteDrink}
                  onChange={(e) => setFavoriteDrink(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'zh-TW' ? '吃貨自介與美食宣言' : 'ひとこと自己紹介'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'zh-TW' ? '探索全城短影音美食，真心記錄必吃與避雷！' : '美味しいお店の記録をシェアしています'}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              />
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
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'zh-TW' ? '超愛吃的美食 / 標籤：' : '大好物・好きなジャンル：'}</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '輸入喜愛料理並按新增（例如：熟成牛排、生魚片）' : '好きな料理名を入力'}
                  value={newFavInput}
                  onChange={(e) => setNewFavInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFavorite();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddFavorite()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.btnAdd}</span>
                </button>
              </div>

              {/* Tags Display */}
              <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                {favoriteTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    <span>❤️ {tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(tag)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Suggestions */}
              <div className="flex items-center gap-1 flex-wrap text-[11px] text-slate-500">
                <span className="font-medium">{lang === 'zh-TW' ? '快捷推薦：' : '候補：'}</span>
                {POPULAR_FAV_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddFavorite(tag)}
                    className="bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 px-2 py-0.5 rounded-md transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Disliked Foods & Dietary Restrictions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <span>⚠️ {lang === 'zh-TW' ? '飲食忌口 / 討厭的地雷食材（絕對避開）：' : '苦手な食べ物・アレルギー・NG食材：'}</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '輸入忌口食材並按新增（例如：香菜、花生過敏、羊肉）' : 'NG食材を入力'}
                  value={newDislikeInput}
                  onChange={(e) => setNewDislikeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDislike();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddDislike()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.btnAdd}</span>
                </button>
              </div>

              {/* Dislike Tags Display */}
              <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-rose-50/50 rounded-xl border border-rose-100">
                {dislikedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs"
                  >
                    <span className="line-through">🚫 {tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDislike(tag)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Dislike Suggestions */}
              <div className="flex items-center gap-1 flex-wrap text-[11px] text-slate-500">
                <span className="font-medium">{lang === 'zh-TW' ? '常見忌口：' : '定番NG：'}</span>
                {POPULAR_DISLIKE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddDislike(tag)}
                    className="bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 px-2 py-0.5 rounded-md transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t.btnSave}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
