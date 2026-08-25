import React, { useState, useEffect, useRef } from 'react';
import type { Restaurant, Friend, RestaurantRatingTag, ShortVideoSource, DishItem, DishRating } from '../../types';
import { parseMenuTextToDishes, processMenuImage } from '../../utils/menuOcr';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { parseVideoUrl, extractRestaurantInfoFromText } from '../../utils/videoParser';
import { 
  X, 
  Plus, 
  Trash2, 
  Flame, 
  RotateCw, 
  ThumbsDown, 
  Bookmark, 
  HelpCircle,
  Sparkles,
  Wand2,
  Check,
  FileText,
  Globe,
  Users,
  Lock,
  Camera,
} from 'lucide-react';

interface RestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (restaurant: Restaurant) => void;
  editingRestaurant?: Restaurant | null;
  friends: Friend[];
  lang: Language;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '台北市': { lat: 25.0478, lng: 121.5319 },
  '新北市': { lat: 25.0118, lng: 121.4658 },
  '台中市': { lat: 24.1477, lng: 120.6736 },
  '台南市': { lat: 22.9997, lng: 120.2270 },
  '高雄市': { lat: 22.6273, lng: 120.3014 },
  '新竹市': { lat: 24.8138, lng: 120.9675 },
  '桃園市': { lat: 24.9936, lng: 121.3010 },
  '東京': { lat: 35.6762, lng: 139.6503 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  '福岡': { lat: 33.5904, lng: 130.4017 },
};

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRestaurant,
  friends,
  lang,
}) => {
  const t = translations[lang];

  // Smart Auto-Fill Input State
  const [smartInputText, setSmartInputText] = useState('');
  const menuFileInputRef = useRef<HTMLInputElement>(null);
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [menuDishes, setMenuDishes] = useState<DishItem[]>([]);
  const [menuTextInput, setMenuTextInput] = useState('');
  const [showTextMenuInput, setShowTextMenuInput] = useState(false);
  const [isProcessingMenu, setIsProcessingMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(lang === 'zh-TW' ? '日式拉麵' : 'ラーメン');
  const [city, setCity] = useState(lang === 'zh-TW' ? '台北市' : '東京');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(25.0478);
  const [lng, setLng] = useState<number>(121.5319);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [priceRange, setPriceRange] = useState<Restaurant['priceRange']>('$$');
  const [ratingTag, setRatingTag] = useState<RestaurantRatingTag>('must_eat');
  const [visibility, setVisibility] = useState<'public' | 'friends_only' | 'private'>('public');
  const [visitCount, setVisitCount] = useState<number>(1);
  const [lastVisitedDate, setLastVisitedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [coverImage, setCoverImage] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  const [mustEatDishes, setMustEatDishes] = useState<string[]>([]);
  const [newMustEatInput, setNewMustEatInput] = useState('');
  
  const [avoidDishes, setAvoidDishes] = useState<string[]>([]);
  const [newAvoidInput, setNewAvoidInput] = useState('');

  const [videos, setVideos] = useState<ShortVideoSource[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoCreator, setNewVideoCreator] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoHighlights, setNewVideoHighlights] = useState('');

  const [recommendedByFriendIds, setRecommendedByFriendIds] = useState<string[]>([]);
  const [dinedWithFriendIds, setDinedWithFriendIds] = useState<string[]>([]);

  useEffect(() => {
    if (editingRestaurant) {
      setName(editingRestaurant.name);
      setCategory(editingRestaurant.category);
      setCity(editingRestaurant.city);
      setAddress(editingRestaurant.address);
      setLat(editingRestaurant.lat);
      setLng(editingRestaurant.lng);
      setGoogleMapsUrl(editingRestaurant.googleMapsUrl || '');
      setPriceRange(editingRestaurant.priceRange);
      setRatingTag(editingRestaurant.ratingTag);
      setVisitCount(editingRestaurant.visitCount);
      setLastVisitedDate(editingRestaurant.lastVisitedDate || '');
      setCoverImage(editingRestaurant.coverImage || '');
      setPersonalNotes(editingRestaurant.personalNotes || '');
      setMustEatDishes(editingRestaurant.mustEatDishes || []);
      setAvoidDishes(editingRestaurant.avoidDishes || []);
      setVisibility(editingRestaurant.visibility || 'public');
      setMenuImages(editingRestaurant.menuImages || []);
      setMenuDishes(editingRestaurant.menuDishes || []);
      setVideos(editingRestaurant.videos || []);
      setRecommendedByFriendIds(editingRestaurant.recommendedByFriendIds || []);
      setDinedWithFriendIds(editingRestaurant.dinedWithFriendIds || []);
      setSmartInputText('');
    } else {
      setName('');
      setCategory(lang === 'zh-TW' ? '日式拉麵' : 'ラーメン');
      setCity(lang === 'zh-TW' ? '台北市' : '東京');
      setAddress('');
      setLat(lang === 'zh-TW' ? 25.0478 : 35.6762);
      setLng(lang === 'zh-TW' ? 121.5319 : 139.6503);
      setGoogleMapsUrl('');
      setPriceRange('$$');
      setRatingTag('must_eat');
      setMenuImages([]);
      setMenuDishes([]);
      setVisibility('public');
      setVisitCount(1);
      setLastVisitedDate(new Date().toISOString().split('T')[0]);
      setCoverImage('');
      setPersonalNotes('');
      setMustEatDishes([]);
      setAvoidDishes([]);
      setVideos([]);
      setRecommendedByFriendIds([]);
      setDinedWithFriendIds([]);
      setSmartInputText('');
    }
  }, [editingRestaurant, isOpen, lang]);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (CITY_COORDINATES[newCity]) {
      const offset = (Math.random() - 0.5) * 0.015;
      setLat(CITY_COORDINATES[newCity].lat + offset);
      setLng(CITY_COORDINATES[newCity].lng + offset);
    }
  };

  // Smart Auto-Fill Logic
  
  
  // 📷 Handle Menu Photo Upload & Auto Parsing
  const handleMenuPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingMenu(true);
    try {
      const result = await processMenuImage(file);
      setMenuImages((prev) => [...prev, result.imageDataUrl]);

      if (result.extractedDishes.length > 0) {
        setMenuDishes((prev) => [...prev, ...result.extractedDishes]);
      } else {
        setShowTextMenuInput(true);
      }
    } catch (err) {
      console.error('Menu processing error', err);
    } finally {
      setIsProcessingMenu(false);
      e.target.value = '';
    }
  };

  // 📝 Parse Raw Text to Dishes
  const handleParseMenuText = () => {
    if (!menuTextInput.trim()) return;
    const extracted = parseMenuTextToDishes(menuTextInput);
    if (extracted.length > 0) {
      setMenuDishes((prev) => {
        const existingNames = new Set(prev.map((d) => d.name));
        const newItems = extracted.filter((d) => !existingNames.has(d.name));
        return [...prev, ...newItems];
      });
      setMenuTextInput('');
      setShowTextMenuInput(false);
    }
  };

  // 🏷️ Set Dish Rating & Auto Sync to Must-Eat / Avoid lists
  const handleSetDishRating = (dishId: string, rating?: DishRating) => {
    setMenuDishes((prev) =>
      prev.map((d) => {
        if (d.id === dishId) {
          const newRating = d.rating === rating ? undefined : rating;

          if (newRating === 'must_eat') {
            if (!mustEatDishes.includes(d.name)) setMustEatDishes((m) => [...m, d.name]);
            setAvoidDishes((a) => a.filter((item) => item !== d.name));
          } else if (newRating === 'avoid') {
            if (!avoidDishes.includes(d.name)) setAvoidDishes((a) => [...a, d.name]);
            setMustEatDishes((m) => m.filter((item) => item !== d.name));
          } else {
            setMustEatDishes((m) => m.filter((item) => item !== d.name));
            setAvoidDishes((a) => a.filter((item) => item !== d.name));
          }

          return { ...d, rating: newRating };
        }
        return d;
      })
    );
  };

  // ✏️ Update Dish Name (Manual correction)
  const handleUpdateDishName = (dishId: string, newName: string) => {
    setMenuDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, name: newName } : d))
    );
  };

  // 🗑️ Remove Dish Item
  const handleRemoveDishItem = (dishId: string) => {
    setMenuDishes((prev) => prev.filter((d) => d.id !== dishId));
  };

  // ➕ Add Single Custom Dish
  const handleAddCustomDish = () => {
    const newDish: DishItem = {
      id: 'dish_' + Date.now(),
      name: '',
      rating: undefined,
    };
    setMenuDishes((prev) => [...prev, newDish]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCoverImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSmartAutoFill = () => {
    if (!smartInputText.trim()) return;

    const extracted = extractRestaurantInfoFromText(smartInputText);

    if (extracted.name) setName(extracted.name);
    if (extracted.category) setCategory(extracted.category);
    if (extracted.city) {
      handleCityChange(extracted.city);
    }
    if (extracted.address) setAddress(extracted.address);
    if (extracted.mustEatDishes.length > 0) {
      setMustEatDishes((prev) => Array.from(new Set([...prev, ...extracted.mustEatDishes])));
    }
    if (extracted.avoidDishes.length > 0) {
      setAvoidDishes((prev) => Array.from(new Set([...prev, ...extracted.avoidDishes])));
    }
    if (extracted.personalNotes && !personalNotes) {
      setPersonalNotes(extracted.personalNotes);
    }

    if (extracted.videoUrl) {
      const parsed = parseVideoUrl(extracted.videoUrl);
      const newVid: ShortVideoSource = {
        id: 'v_' + Date.now(),
        platform: parsed.platform,
        url: extracted.videoUrl,
        title: extracted.name ? `${extracted.name} 介紹` : parsed.displayLabel,
      };
      setVideos((prev) => [...prev, newVid]);
    }

    setAutoFillSuccess(true);
    setTimeout(() => setAutoFillSuccess(false), 3000);
  };

  const handleAddMustEat = () => {
    if (!newMustEatInput.trim()) return;
    setMustEatDishes([...mustEatDishes, newMustEatInput.trim()]);
    setNewMustEatInput('');
  };

  const handleRemoveMustEat = (index: number) => {
    setMustEatDishes(mustEatDishes.filter((_, i) => i !== index));
  };

  const handleAddAvoidDish = () => {
    if (!newAvoidInput.trim()) return;
    setAvoidDishes([...avoidDishes, newAvoidInput.trim()]);
    setNewAvoidInput('');
  };

  const handleRemoveAvoidDish = (index: number) => {
    setAvoidDishes(avoidDishes.filter((_, i) => i !== index));
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    const parsed = parseVideoUrl(newVideoUrl.trim());
    const highlights = newVideoHighlights
      ? newVideoHighlights.split(/[,， 、]+/).filter(Boolean)
      : undefined;

    const newVid: ShortVideoSource = {
      id: 'v_' + Date.now(),
      platform: parsed.platform,
      url: newVideoUrl.trim(),
      creatorName: newVideoCreator.trim() || undefined,
      title: newVideoTitle.trim() || undefined,
      highlights,
    };

    setVideos([...videos, newVid]);
    setNewVideoUrl('');
    setNewVideoCreator('');
    setNewVideoTitle('');
    setNewVideoHighlights('');
  };

  const handleRemoveVideo = (id: string) => {
    setVideos(videos.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(lang === 'zh-TW' ? '請填寫餐廳名稱！' : '店名を入力してください！');
      return;
    }

    const restaurantData: Restaurant = {
      id: editingRestaurant ? editingRestaurant.id : 'r_' + Date.now(),
      name: name.trim(),
      category: category.trim(),
      city: city.trim(),
      address: address.trim() || `${city}${name}`,
      lat: Number(lat) || 25.0478,
      lng: Number(lng) || 121.5319,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      priceRange,
      ratingTag,
      visitCount: Number(visitCount) || 0,
      lastVisitedDate: lastVisitedDate || undefined,
      mustEatDishes,
      avoidDishes,
      personalNotes: personalNotes.trim(),
      videos,
      recommendedByFriendIds,
      dinedWithFriendIds,
      coverImage: coverImage.trim() || undefined,
      createdAt: editingRestaurant ? editingRestaurant.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(restaurantData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-lg font-bold text-white">
              {editingRestaurant ? t.modalTitleEdit : t.modalTitleAdd}
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
          {/* 🪄 Smart Auto-Fill Banner */}
          {!editingRestaurant && (
            <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'zh-TW' ? '🪄 智能一鍵自動填入（貼上短影音網址或社群貼文）' : '🪄 AI 自動入力（動画URLやSNS投稿を貼り付け）'}</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {lang === 'zh-TW' ? '省時極速' : '時短'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '貼上 IG Reels / TikTok 網址，例如：https://www.instagram.com/reel/...' : 'IG Reels / TikTok / YouTube Shorts URL を貼り付け'}
                  value={smartInputText}
                  onChange={(e) => setSmartInputText(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white font-medium shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleSmartAutoFill}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 shrink-0"
                >
                  {autoFillSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'zh-TW' ? '已自動解析！' : '解析完了！'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'zh-TW' ? '一鍵自動填入' : '自動解析'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {lang === 'zh-TW'
                  ? '💡 支援自動提取店名、分類、必吃餐點與短影音來源，解析後仍可自由微調！'
                  : '💡 店名・ジャンル・おすすめ料理を自動抽出します。抽出後も手動で編集可能です。'}
              </p>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>🏪</span> {t.secBasicInfo}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelSpotName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'zh-TW' ? '例如：隱家拉麵 赤峰店' : '例：麺屋 一燈'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelCategory}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '日式拉麵 / 燒肉 / 甜點 / 火鍋' : 'ラーメン / 焼肉 / スイーツ / 居酒屋'}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelCity}
                </label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelAddress}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'zh-TW' ? '例如：台北市大同區南京西路25巷28號' : '例：東京都渋谷区神宮前1-2-3'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelGoogleMapsUrl}
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.labelPriceRange} *</span>
                  <span className="text-[11px] font-bold text-amber-600">
                    {priceRange === '$' && (lang === 'zh-TW' ? '💰 銅板小吃 (< $200)' : '💰 リーズナブル (~1,000円)')}
                    {priceRange === '$$' && (lang === 'zh-TW' ? '🍽️ 日常聚餐 ($200 ~ $500)' : '🍽️ 定番ランチ (1,000~2,500円)')}
                    {priceRange === '$$$' && (lang === 'zh-TW' ? '✨ 精緻享受 ($500 ~ $1,500)' : '✨ ディナー・居酒屋 (2,500~8,000円)')}
                    {priceRange === '$$$$' && (lang === 'zh-TW' ? '💎 頂級奢華 ($1,500+)' : '💎 高級・コース (8,000円~)')}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { lvl: '$' as const, label: lang === 'zh-TW' ? '銅板平價' : '手頃', range: '< $200' },
                    { lvl: '$$' as const, label: lang === 'zh-TW' ? '日常聚餐' : '普通', range: '$200-500' },
                    { lvl: '$$$' as const, label: lang === 'zh-TW' ? '精緻饗宴' : 'プチ贅沢', range: '$500-1.5k' },
                    { lvl: '$$$$' as const, label: lang === 'zh-TW' ? '奢華頂級' : '高級', range: '$1.5k+' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => setPriceRange(item.lvl)}
                      className={`p-2 rounded-2xl text-center border transition-all ${
                        priceRange === item.lvl
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-102 ring-2 ring-amber-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-black text-sm">{item.lvl}</div>
                      <div className="text-[10px] font-bold opacity-90">{item.range}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* Section 2: Store Overall Rating Tag */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>🎯</span> {lang === 'zh-TW' ? '店家整體評價定位' : '店舗ステータス'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {lang === 'zh-TW' ? '選擇這間店在您心中的定位：' : '評価タグを選択：'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRatingTag('must_eat')}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    ratingTag === 'must_eat'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs ring-2 ring-rose-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Flame className="w-4 h-4 shrink-0 fill-current" />
                  <span>{t.tagMustEat}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('frequent_visit')}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    ratingTag === 'frequent_visit'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RotateCw className="w-4 h-4 shrink-0" />
                  <span>{t.tagFrequentVisit}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('wishlist')}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    ratingTag === 'wishlist'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-4 h-4 shrink-0" />
                  <span>{t.tagWishlist}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('mediocre')}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    ratingTag === 'mediocre'
                      ? 'bg-slate-600 text-white border-slate-600 shadow-xs ring-2 ring-slate-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>{t.tagMediocre}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('avoid_again')}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left col-span-2 sm:col-span-2 ${
                    ratingTag === 'avoid_again'
                      ? 'bg-slate-950 text-rose-300 border-slate-950 shadow-md ring-2 ring-rose-400'
                      : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 shrink-0 text-rose-500" />
                  <div className="flex flex-col">
                    <span>{lang === 'zh-TW' ? '☠️ 整間店列入黑名單 (永久封殺)' : '☠️ 店舗ブラックリスト (二度と行かない)'}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {lang === 'zh-TW' ? '環境極差、態度惡劣或全面踩雷' : '店全体がNG・リピート不可'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelVisitCount}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={visitCount}
                    onChange={(e) => setVisitCount(parseInt(e.target.value) || 0)}
                    className="w-24 text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-center bg-white"
                  />
                  <span className="text-xs text-slate-500">{t.timesUnit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelLastDate}
                </label>
                <input
                  type="date"
                  value={lastVisitedDate}
                  onChange={(e) => setLastVisitedDate(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 📸 Smart Menu OCR & Interactive Dish Tagger */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋</span> {lang === 'zh-TW' ? '菜單圖片上傳 & 菜色點選評價' : 'メニュー写真・料理別評価'}
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => menuFileInputRef.current?.click()}
                  disabled={isProcessingMenu}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isProcessingMenu ? '處理中...' : '📷 上傳菜單照片'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTextMenuInput(!showTextMenuInput)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  <span>貼上菜單文字</span>
                </button>
              </div>
            </div>

            {/* Hidden Menu File Input */}
            <input
              type="file"
              ref={menuFileInputRef}
              onChange={handleMenuPhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Menu Photo Gallery Preview */}
            {menuImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-1">
                {menuImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 shadow-2xs shrink-0 group">
                    <img src={img} alt="菜單" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMenuImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Batch Paste Text Menu Box */}
            {showTextMenuInput && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700">
                  貼上或輸入菜單文字（每行一道菜，系統會自動拆解）：
                </label>
                <textarea
                  rows={3}
                  placeholder="濃厚豚骨拉麵 240元\n辛味噌拉麵 260元\n日式煎餃 80元\n唐揚炸雞 120元"
                  value={menuTextInput}
                  onChange={(e) => setMenuTextInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTextMenuInput(false)}
                    className="px-3 py-1 text-xs text-slate-500 font-bold hover:bg-slate-200 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleParseMenuText}
                    className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
                  >
                    ✨ 自動解析為菜色列表
                  </button>
                </div>
              </div>
            )}

            {/* 🍽️ Interactive Dishes Tagger List (With Inline Edit Correction) */}
            {menuDishes.length > 0 ? (
              <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>🍽️ 點擊標籤直接為菜色評分（可隨時修改菜名訂正）：</span>
                  <button
                    type="button"
                    onClick={handleAddCustomDish}
                    className="text-indigo-600 hover:text-indigo-800 font-black flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增菜色</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {menuDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-slate-300"
                    >
                      {/* Dish Name (Editable Input for instant typo correction) */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <input
                          type="text"
                          value={dish.name}
                          onChange={(e) => handleUpdateDishName(dish.id, e.target.value)}
                          placeholder="菜色名稱 (點此修改訂正)"
                          className="w-full text-xs font-bold text-slate-800 px-2 py-1 rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-indigo-50/30 transition-colors"
                        />
                        {dish.price && (
                          <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                            {dish.price}
                          </span>
                        )}
                      </div>

                      {/* 4-Level Dish Taste Rating Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSetDishRating(dish.id, 'must_eat')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            dish.rating === 'must_eat'
                              ? 'bg-amber-500 text-white shadow-2xs ring-1 ring-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          🌟 必吃
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetDishRating(dish.id, 'tasty')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            dish.rating === 'tasty'
                              ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          👍 好吃
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetDishRating(dish.id, 'mediocre')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            dish.rating === 'mediocre'
                              ? 'bg-slate-600 text-white shadow-2xs ring-1 ring-slate-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          😐 普通
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetDishRating(dish.id, 'avoid')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            dish.rating === 'avoid'
                              ? 'bg-rose-600 text-white shadow-2xs ring-1 ring-rose-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          ❌ 踩雷
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveDishItem(dish.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition-colors cursor-pointer ml-0.5"
                          title="刪除此道菜"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Quick Manual Input Fallback */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-200">
                {/* Must-Eat Dishes */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>{lang === 'zh-TW' ? '🌟 此店必點招牌' : '🌟 必食名物メニュー'}</span>
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      placeholder="手動新增必吃招牌"
                      value={newMustEatInput}
                      onChange={(e) => setNewMustEatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMustEat();
                        }
                      }}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddMustEat}
                      className="px-2.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                    >
                      {t.btnAdd}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mustEatDishes.map((dish, i) => (
                      <span key={i} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <span>🌟 {dish}</span>
                        <button type="button" onClick={() => handleRemoveMustEat(i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Avoid Dishes */}
                <div>
                  <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1">
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === 'zh-TW' ? '❌ 此店特定雷菜' : '❌ 避けるべき料理'}</span>
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      placeholder="手動新增特定雷菜"
                      value={newAvoidInput}
                      onChange={(e) => setNewAvoidInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAvoidDish();
                        }
                      }}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-xl border border-rose-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAvoidDish}
                      className="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      {t.btnAdd}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {avoidDishes.map((dish, i) => (
                      <span key={i} className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <span>❌ {dish}</span>
                        <button type="button" onClick={() => handleRemoveAvoidDish(i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Section 4: Short Videos */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>🎬</span> {t.secVideos}
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.labelVideoUrl}
                </label>
                <input
                  type="url"
                  placeholder={t.placeholderVideoUrl}
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder={t.creatorAccount}
                    value={newVideoCreator}
                    onChange={(e) => setNewVideoCreator(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder={t.videoTitleNote}
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddVideo}
                className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.btnAddVideo}
              </button>
            </div>

            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((vid) => {
                  const info = parseVideoUrl(vid.url);
                  return (
                    <div
                      key={vid.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${info.badgeBg}`}>
                          {info.displayLabel}
                        </span>
                        <span className="truncate font-medium text-slate-700">
                          {vid.title || vid.url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(vid.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Friends Link */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>👥</span> {t.secFriendsLink}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.labelRecommendingFriends}
              </label>
              <div className="flex flex-wrap gap-2">
                {friends.map((f) => {
                  const isSelected = recommendedByFriendIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRecommendedByFriendIds(recommendedByFriendIds.filter((id) => id !== f.id));
                        } else {
                          setRecommendedByFriendIds([...recommendedByFriendIds, f.id]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                        {f.avatar && (f.avatar.startsWith('data:') || f.avatar.startsWith('http') || f.avatar.length > 20) ? (
                          <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{f.avatar || '🥢'}</span>
                        )}
                      </div>
                      <span>{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.labelCompanionFriends}
              </label>
              <div className="flex flex-wrap gap-2">
                {friends.map((f) => {
                  const isSelected = dinedWithFriendIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setDinedWithFriendIds(dinedWithFriendIds.filter((id) => id !== f.id));
                        } else {
                          setDinedWithFriendIds([...dinedWithFriendIds, f.id]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                        {f.avatar && (f.avatar.startsWith('data:') || f.avatar.startsWith('http') || f.avatar.length > 20) ? (
                          <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{f.avatar || '🥢'}</span>
                        )}
                      </div>
                      <span>{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 6: Notes & Cover */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <span>📝</span> {t.secNotesAndPhoto}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  {lang === 'zh-TW' ? '📷 美食/店家封面照片' : '📷 店舗・料理のカバー写真'}
                </label>

                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      imageInputMode === 'upload' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    上傳照片
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      imageInputMode === 'url' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    圖片網址
                  </button>
                </div>
              </div>

              {/* Photo Preview & Upload Area */}
              {coverImage ? (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group">
                  <img
                    src={coverImage}
                    alt="封面預覽"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>更換照片</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>移除封面</span>
                    </button>
                  </div>
                </div>
              ) : imageInputMode === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {lang === 'zh-TW' ? '點擊上傳手機相簿/電腦中的美食照片' : 'クリックして写真・アルバムから選択'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      支援 JPG、PNG、WEBP，系統會自動進行高畫質智慧壓縮
                    </p>
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.labelPersonalNotes}
              </label>
              <textarea
                rows={3}
                placeholder={lang === 'zh-TW' ? '例如：建議平日11:30前到免排隊，醬汁濃郁但略偏鹹，附餐白飯可續...' : '例：開店15分前到着推奨、スープ濃厚、トッピング増しがおすすめ...'}
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
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
            className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            {editingRestaurant ? t.btnSave : t.btnCreate}
          </button>
        </div>
      </div>
    </div>
  );
};
