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
  currentFoodieId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  friends: Friend[];
  lang: Language;
  onDeleteRestaurant?: (id: string) => void;
}

function renderSafeAvatar(avatar: string | undefined, defaultEmoji: string = '🥢', sizeClass: string = 'w-full h-full') {
  if (avatar && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.length > 20)) {
    return <img src={avatar} alt="avatar" className={`${sizeClass} object-cover`} />;
  }
  return <span>{avatar || defaultEmoji}</span>;
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
  currentFoodieId,
  currentUserName = '熱心吃貨',
  currentUserAvatar = '🥢',
  friends,
  lang,
  onDeleteRestaurant,
}) => {
  const t = translations[lang];

  // Smart Auto-Fill Input State
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState<boolean>(false);
  const [currentAuthorInfo, setCurrentAuthorInfo] = useState<{ name: string; avatar: string }>({ name: '', avatar: '' });
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
  const [googleRating, setGoogleRating] = useState<number>(4.5);
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
      const contributions = editingRestaurant.contributions || [];
      const cleanMyId = (currentFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
      const isGuest = !cleanMyId || cleanMyId === 'guest';

      // 🔍 1. Find if current user already has a contribution in this aggregated spot
      let hasMyRecord = false;
      let myIdx = -1;

      if (contributions.length > 0) {
        myIdx = contributions.findIndex((c) => c.isMine);
        hasMyRecord = myIdx !== -1;
      }

      let initialIdx = hasMyRecord ? myIdx : 0;
      let isMine = hasMyRecord;

      // 🔍 2. If single spot without contributions pre-aggregated:
      if (!hasMyRecord && contributions.length === 0) {
        const authorId = (editingRestaurant.authorFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
        if (!isGuest && authorId && authorId === cleanMyId) {
          isMine = true;
        } else if (!editingRestaurant.authorFoodieId && !editingRestaurant.authorName) {
          isMine = true;
        } else {
          isMine = false;
        }
      }

      setActiveReviewIndex(initialIdx);
      setIsReadOnlyMode(!isMine);

      const activeContribution = contributions[initialIdx];
      setCurrentAuthorInfo({
        name: activeContribution?.authorName || editingRestaurant.authorName || (isMine ? (currentUserName || '我') : '熱心吃貨'),
        avatar: activeContribution?.authorAvatar || editingRestaurant.authorAvatar || (isMine ? (currentUserAvatar || '👑') : '🥢'),
      });

      setName(editingRestaurant.name);
      setCategory(editingRestaurant.category);
      setCity(editingRestaurant.city);
      setAddress(editingRestaurant.address);
      setLat(Number(editingRestaurant.lat) || 25.0478);
      setLng(Number(editingRestaurant.lng) || 121.5319);
      setGoogleMapsUrl(editingRestaurant.googleMapsUrl || '');
      setGoogleRating(editingRestaurant.googleRating || 4.5);
      setPriceRange(editingRestaurant.priceRange || '$');
      setRatingTag(activeContribution?.ratingTag || editingRestaurant.ratingTag || 'must_eat');
      setVisibility(activeContribution?.visibility || editingRestaurant.visibility || 'public');
      setVisitCount(activeContribution?.visitCount ?? editingRestaurant.visitCount ?? 1);
      setLastVisitedDate(
        editingRestaurant.lastVisitedDate || new Date().toISOString().split('T')[0]
      );
      setCoverImage(editingRestaurant.coverImage || '');
      setMenuImages(editingRestaurant.menuImages || []);
      setMenuDishes(activeContribution?.menuDishes || editingRestaurant.menuDishes || []);
      setPersonalNotes(activeContribution?.personalNotes || editingRestaurant.personalNotes || '');
      setMustEatDishes(activeContribution?.mustEatDishes || editingRestaurant.mustEatDishes || []);
      setAvoidDishes(activeContribution?.avoidDishes || editingRestaurant.avoidDishes || []);
      setVideos(editingRestaurant.videos || []);
      setRecommendedByFriendIds(editingRestaurant.recommendedByFriendIds || []);
      setDinedWithFriendIds(editingRestaurant.dinedWithFriendIds || []);
    } else {
      setIsReadOnlyMode(false);
      setActiveReviewIndex(0);
      setName('');
      setCategory(lang === 'zh-TW' ? '日式拉麵' : 'ラーメン');
      setCity(lang === 'zh-TW' ? '台北市' : '東京');
      setAddress('');
      setLat(25.0478);
      setLng(121.5319);
      setGoogleMapsUrl('');
      setGoogleRating(4.5);
      setPriceRange('$');
      setRatingTag('must_eat');
      setVisibility('public');
      setVisitCount(1);
      setLastVisitedDate(new Date().toISOString().split('T')[0]);
      setCoverImage('');
      setMenuImages([]);
      setMenuDishes([]);
      setPersonalNotes('');
      setMustEatDishes([]);
      setAvoidDishes([]);
      setVideos([]);
      setRecommendedByFriendIds([]);
      setDinedWithFriendIds([]);
    }
  }, [editingRestaurant, isOpen, lang, currentFoodieId, currentUserName, currentUserAvatar]);

  // Switch between different foodies' reviews for the same restaurant
  const handleSelectReview = (idx: number) => {
    if (!editingRestaurant?.contributions || !editingRestaurant.contributions[idx]) return;
    const c = editingRestaurant.contributions[idx];
    const cleanMyId = (currentFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
    setActiveReviewIndex(idx);
    setIsReadOnlyMode(!c.isMine);
    setCurrentAuthorInfo({
      name: c.authorName,
      avatar: c.authorAvatar,
    });
    setRatingTag(c.ratingTag);
    setVisitCount(c.visitCount || 1);
    setMustEatDishes(c.mustEatDishes || []);
    setAvoidDishes(c.avoidDishes || []);
    setPersonalNotes(c.personalNotes || '');
    if (c.videos) setVideos(c.videos);
    if (c.menuDishes) setMenuDishes(c.menuDishes);
  };

    // 📌 一鍵收進我的口袋名單 (Clone and switch into editable draft for current user)
  const handleCloneToMyPocket = () => {
    const cleanMyId = (currentFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
    setIsReadOnlyMode(false);
    setPersonalNotes(''); // Clear notes so user writes own evaluation
    setVisitCount(0);
    setRatingTag('wishlist');
    setVisibility('public');
    alert(lang === 'zh-TW'
      ? '🎉 已將此店家基本資料複製為您的個人草稿！您可以填寫自己的評分、必吃菜色與筆記並儲存到我的口袋。'
      : '🎉 口コミを自分用にコピーしました！自由に編集して保存できます。');
  };

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
    if (!name.trim()) return;

    const cleanMyId = (currentFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
    const myContribution = editingRestaurant?.contributions?.find((c) => c.isMine);
    const isEditingMine = !isReadOnlyMode && (
      Boolean(myContribution) || 
      (editingRestaurant && editingRestaurant.authorFoodieId === cleanMyId)
    );

    const restaurantData: Restaurant = {
      id: isEditingMine ? (myContribution?.restaurantId || editingRestaurant!.id) : `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category: category.trim() || (lang === 'zh-TW' ? '精選美食' : 'グルメ'),
      city,
      address: address.trim(),
      lat,
      lng,
      googleMapsUrl: googleMapsUrl.trim(),
      googleRating,
      priceRange,
      ratingTag,
      visibility,
      visitCount,
      lastVisitedDate,
      coverImage,
      menuImages,
      menuDishes,
      personalNotes: personalNotes.trim(),
      mustEatDishes,
      avoidDishes,
      videos,
      recommendedByFriendIds,
      dinedWithFriendIds,
      authorFoodieId: cleanMyId || 'foodie',
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
      createdAt: isEditingMine ? editingRestaurant!.createdAt : new Date().toISOString(),
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
            <span className="text-xl">{isReadOnlyMode ? '🥢' : '✨'}</span>
            <h2 className="text-lg font-bold text-white">
              {isReadOnlyMode 
                ? (lang === 'zh-TW' ? '吃貨美食筆記與評論檢視' : 'グルメ口コミ・記録閲覧')
                : editingRestaurant 
                ? (lang === 'zh-TW' ? '編輯我的美食紀錄' : t.modalTitleEdit)
                : (lang === 'zh-TW' ? '新增我的美食紀錄' : t.modalTitleAdd)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            👥 多吃貨心得切換籤頁 (永遠顯示，無論編輯或唯讀模式)
            只要這間店有 2 位以上吃貨留下紀錄就顯示
            ══════════════════════════════════════════════════════════ */}
        {editingRestaurant?.contributions && editingRestaurant.contributions.length > 1 && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-5 py-3 border-b border-purple-700 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-100 flex items-center gap-1.5">
                <span>👥</span>
                <span>{lang === 'zh-TW' ? `共 ${editingRestaurant.contributions.length} 位吃貨記錄了這間店` : `${editingRestaurant.contributions.length} 人の口コミ`}</span>
              </span>
              <span className="text-[10px] font-bold text-purple-300">
                點擊切換查看不同吃貨心得
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {editingRestaurant.contributions.map((c, idx) => (
                <button
                  key={c.restaurantId + '_' + idx}
                  type="button"
                  onClick={() => handleSelectReview(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    activeReviewIndex === idx
                      ? 'bg-white text-purple-900 shadow-md ring-2 ring-purple-300'
                      : 'bg-purple-800/60 hover:bg-purple-700/60 text-purple-100 border border-purple-600'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {renderSafeAvatar(c.authorAvatar, c.isMine ? '👑' : '🥢')}
                  </div>
                  <span>{c.isMine ? (lang === 'zh-TW' ? '👑 我的筆記' : '👑 マイ記録') : (c.authorName || '熱心吃貨')}</span>
                  <span className="text-[10px] opacity-75">
                    {c.ratingTag === 'must_eat' ? '🔥' : c.ratingTag === 'frequent_visit' ? '🔄' : c.ratingTag === 'avoid_again' ? '☠️' : c.ratingTag === 'wishlist' ? '📌' : '📝'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isReadOnlyMode ? (
          /* ═══════════════════════════════════════════════════════════════════════════
             📖 唯讀吃貨心得檢視模式 (Clean Read-Only View, NO form inputs!)
             ═══════════════════════════════════════════════════════════════════════════ */
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">


                        {/* 🔒 唯讀提示與一鍵複製按鈕橫幅 */}
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-4 rounded-2xl border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-300 overflow-hidden flex items-center justify-center text-lg shrink-0 shadow-2xs">
                  {renderSafeAvatar(currentAuthorInfo.avatar, '🥢')}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {lang === 'zh-TW' ? `這是吃貨【${currentAuthorInfo.name}】的美食筆記（唯讀模式）` : `${currentAuthorInfo.name} さんの口コミ（閲覧モード）`}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {lang === 'zh-TW' 
                      ? (editingRestaurant?.contributions?.some((c) => c.isMine) 
                          ? '您已在口袋名單中收錄了此店家，可切換至「👑 我的筆記」進行編輯！' 
                          : '無法直接修改對方紀錄，您可以複製並建立自己的專屬口袋名單！')
                      : 'この記録をコピーして自分のリストに追加できます！'}
                  </span>
                </div>
              </div>

              {editingRestaurant?.contributions?.some((c) => c.isMine) ? (
                <button
                  type="button"
                  onClick={() => {
                    const myIdx = editingRestaurant.contributions!.findIndex((c) => c.isMine);
                    if (myIdx !== -1) handleSelectReview(myIdx);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>👑 切換至我的筆記修改</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloneToMyPocket}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'zh-TW' ? '📌 一鍵收進我的口袋名單' : '📌 自分のリストに追加'}</span>
                </button>
              )}
            </div>

            {/* 店家核心資訊小卡 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {category} · {priceRange} · {city}
                  </span>
                  {ratingTag === 'must_eat' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{t.tagMustEat}</span>
                    </span>
                  )}
                  {ratingTag === 'frequent_visit' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      <span>{t.tagFrequentVisit}</span>
                    </span>
                  )}
                  {ratingTag === 'wishlist' && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-xs flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      <span>{t.tagWishlist}</span>
                    </span>
                  )}
                  {ratingTag === 'avoid_again' && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-900 text-rose-300 font-black text-xs flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-slate-500">
                  去過次數：{visitCount} 次
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900">{name}</h3>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <span>📍 {address}</span>
              </p>

              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>開啟 Google 地圖導航</span>
                </a>
              )}
            </div>

            {/* 必吃與雷菜展示 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>推薦必吃 / 招牌餐點</span>
                </span>
                {mustEatDishes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {mustEatDishes.map((d, i) => (
                      <span key={i} className="bg-amber-100 text-amber-950 font-bold text-xs px-2.5 py-1 rounded-xl">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700/70 italic">尚未填寫特定招牌菜</p>
                )}
              </div>

              <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 space-y-2">
                <span className="text-xs font-black text-rose-900 flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4 text-rose-600" />
                  <span>建議避開 / 踩雷菜色</span>
                </span>
                {avoidDishes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {avoidDishes.map((d, i) => (
                      <span key={i} className="bg-rose-100 text-rose-950 font-bold text-xs px-2.5 py-1 rounded-xl line-through">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-700/70 italic">無特定踩雷備註</p>
                )}
              </div>
            </div>

            {/* 心得筆記展示 */}
            {personalNotes && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-black text-slate-700 block">📝 吃貨私房心得筆記：</span>
                <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                  "{personalNotes}"
                </p>
              </div>
            )}

            {/* 探店短影音展示 */}
            {videos.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-700 block">📹 探店短影音 ({videos.length})：</span>
                <div className="space-y-2">
                  {videos.map((v, i) => (
                    <a
                      key={i}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-colors text-xs"
                    >
                      <span className="font-bold text-slate-800 truncate">
                        🎬 {v.title || v.creatorName ? `${v.creatorName || ''} - ${v.title || '探店推薦'}` : v.url}
                      </span>
                      <span className="text-purple-600 font-bold shrink-0 ml-2">點擊觀看 ↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════════════
             ✍️ 編輯 / 新增模式 (Full Editable Form)
             ═══════════════════════════════════════════════════════════════════════════ */
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
              </div>
            )}

            {/* 🏪 基本店家資訊 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span>🏪</span>
                  <span>{t.secBasicInfo}</span>
                </h3>
              </div>

              {/* 🌐 Visibility Selector */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/70 to-blue-50/70 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>這間店的公開範圍設定：</span>
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    {visibility === 'public' ? '🌐 全公開 (社群與好友皆可見)' : visibility === 'friends_only' ? '👥 好友限定 (僅吃貨朋友可見)' : '🔒 私密 (僅自己可見)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      visibility === 'public'
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 scale-102'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 全公開</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('friends_only')}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      visibility === 'friends_only'
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 scale-102'
                        : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>👥 好友限定</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      visibility === 'private'
                        ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400 scale-102'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>🔒 私密</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelSpotName}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'zh-TW' ? '例如：隱家拉麵 赤峰店' : '例：一蘭 新宿中央東口店'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelCategory}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'zh-TW' ? '例如：日式拉麵、燒肉居酒屋' : '例：ラーメン、焼肉'}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
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
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.keys(CITY_COORDINATES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelAddress}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'zh-TW' ? '例如：台北市大同區南京西路25巷28號' : '例：東京都新宿区新宿3-34-11'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Maps 連結 (選填)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  價位級距 *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['$', '$$', '$$$', '$$$$'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriceRange(p)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        priceRange === p
                          ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ⭐ 評價定位 */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span>⭐</span>
                <span>{lang === 'zh-TW' ? '評價定位' : '評価設定'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRatingTag('must_eat')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratingTag === 'must_eat'
                      ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-md'
                      : 'bg-slate-50 hover:bg-amber-50/50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs mb-0.5">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{t.tagMustEat}</span>
                  </div>
                  <p className="text-[10px] opacity-85">超推必吃、無腦首選</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('frequent_visit')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratingTag === 'frequent_visit'
                      ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 shadow-md'
                      : 'bg-slate-50 hover:bg-emerald-50/50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs mb-0.5">
                    <RotateCw className="w-4 h-4" />
                    <span>{t.tagFrequentVisit}</span>
                  </div>
                  <p className="text-[10px] opacity-85">日常愛店、常去回訪</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('wishlist')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratingTag === 'wishlist'
                      ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 shadow-md'
                      : 'bg-slate-50 hover:bg-blue-50/50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs mb-0.5">
                    <Bookmark className="w-4 h-4" />
                    <span>{t.tagWishlist}</span>
                  </div>
                  <p className="text-[10px] opacity-85">待吃名單、想去探店</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRatingTag('avoid_again')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    ratingTag === 'avoid_again'
                      ? 'bg-slate-900 text-rose-300 border-slate-950 ring-2 ring-rose-500 shadow-md'
                      : 'bg-slate-50 hover:bg-rose-50/50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs mb-0.5 text-rose-400">
                    <ThumbsDown className="w-4 h-4" />
                    <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
                  </div>
                  <p className="text-[10px] opacity-85">踩雷勿入、不會再去</p>
                </button>
              </div>
            </div>

            {/* 🌟 必吃與雷菜 */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 必吃菜色 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{t.mustEatDishesTitle}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="輸入必吃菜色按新增"
                      value={newMustEatInput}
                      onChange={(e) => setNewMustEatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newMustEatInput.trim()) {
                            setMustEatDishes([...mustEatDishes, newMustEatInput.trim()]);
                            setNewMustEatInput('');
                          }
                        }
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMustEatInput.trim()) {
                          setMustEatDishes([...mustEatDishes, newMustEatInput.trim()]);
                          setNewMustEatInput('');
                        }
                      }}
                      className="px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mustEatDishes.map((d, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-950 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        {d}
                        <button type="button" onClick={() => setMustEatDishes(mustEatDishes.filter((_, i) => i !== idx))} className="text-amber-700 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 踩雷菜色 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-rose-900 flex items-center gap-1">
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t.avoidDishesTitle}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="輸入雷菜按新增"
                      value={newAvoidInput}
                      onChange={(e) => setNewAvoidInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newAvoidInput.trim()) {
                            setAvoidDishes([...avoidDishes, newAvoidInput.trim()]);
                            setNewAvoidInput('');
                          }
                        }
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAvoidInput.trim()) {
                          setAvoidDishes([...avoidDishes, newAvoidInput.trim()]);
                          setNewAvoidInput('');
                        }
                      }}
                      className="px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {avoidDishes.map((d, idx) => (
                      <span key={idx} className="bg-rose-100 text-rose-950 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        {d}
                        <button type="button" onClick={() => setAvoidDishes(avoidDishes.filter((_, i) => i !== idx))} className="text-rose-700 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 📝 心得筆記 */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700">
                {t.labelPersonalNotes}
              </label>
              <textarea
                rows={3}
                placeholder={lang === 'zh-TW' ? '例如：建議平日11:30前到免排隊，醬汁濃郁但略偏鹹，附餐白飯可續...' : '例：開店15分前到着推奨、スープ濃厚、トッピング増しがおすすめ...'}
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-white"
              />
            </div>
          </form>
        )}

                {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {/* Left: Delete My Pocket Record Button (if user owns a record in this restaurant) */}
          <div>
            {Boolean(
              editingRestaurant?.contributions?.some((c) => c.isMine) || 
              (!isReadOnlyMode && editingRestaurant && (!editingRestaurant.authorFoodieId || editingRestaurant.authorFoodieId === (currentFoodieId || '').toLowerCase().trim()))
            ) && onDeleteRestaurant && (
              <button
                type="button"
                onClick={() => {
                  const myRecId = editingRestaurant?.contributions?.find((c) => c.isMine)?.restaurantId || editingRestaurant?.id;
                  if (myRecId) {
                    onDeleteRestaurant(myRecId);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-rose-300"
                title="從我的口袋名單中刪除這間店"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{lang === 'zh-TW' ? '🗑️ 從我的口袋刪除' : '🗑️ リストから削除'}</span>
              </button>
            )}
          </div>

          {/* Right: Cancel / Save / Clone Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {isReadOnlyMode ? '關閉' : t.btnCancel}
            </button>

            {isReadOnlyMode ? (
              editingRestaurant?.contributions?.some((c) => c.isMine) ? (
                <button
                  type="button"
                  onClick={() => {
                    const myIdx = editingRestaurant.contributions!.findIndex((c) => c.isMine);
                    if (myIdx !== -1) handleSelectReview(myIdx);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>👑 切換至我的筆記修改</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloneToMyPocket}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>📌 一鍵收進我的口袋名單</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
              >
                {editingRestaurant ? t.btnSave : '儲存到我的口袋'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

