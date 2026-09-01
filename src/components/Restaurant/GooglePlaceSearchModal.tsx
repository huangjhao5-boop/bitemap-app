import React, { useState, useEffect } from 'react';
import type { Restaurant, RestaurantRatingTag, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { searchGooglePlacesOnline, type PlaceSearchResult } from '../../utils/placeSearch';
import { calculateDistanceKm, formatDistance, type UserLocation } from '../../utils/geo';
import { 
  Search, 
  MapPin, 
  Plus, 
  ExternalLink, 
  Flame, 
  RotateCw, 
  Bookmark, 
  ThumbsDown, 
  X, 
  Sparkles, 
  Navigation,
  Globe,
  Check
} from 'lucide-react';

interface GooglePlaceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRestaurant: (restaurant: Restaurant) => void;
  userLocation: UserLocation;
  lang: Language;
  userProfile: UserProfile;
}

export const GooglePlaceSearchModal: React.FC<GooglePlaceSearchModalProps> = ({
  isOpen,
  onClose,
  onAddRestaurant,
  userLocation,
  lang,
  userProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Quick popular search presets
  const presets = [
    '台北 隱家拉麵',
    '詹記麻辣火鍋',
    '鼎泰豐 信義店',
    'TAMED FOX',
    '台中 和牛燒肉',
    '台南 牛肉湯',
    '東京 一蘭拉麵',
    '福岡 炭火燒鳥',
  ];

  const handleSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!q) return;

    if (queryText !== undefined) {
      setSearchQuery(queryText);
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const items = await searchGooglePlacesOnline(q);
      setResults(items);
    } catch (e) {
      console.error('Search failed', e);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickAdd = (place: PlaceSearchResult, tag: RestaurantRatingTag) => {
    const newRestaurant: Restaurant = {
      id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: place.name,
      category: place.category,
      city: place.city,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      googleMapsUrl: place.googleMapsUrl,
      googleRating: 4.6,
      priceRange: place.priceRange,
      ratingTag: tag,
      visibility: 'public',
      visitCount: tag === 'wishlist' ? 0 : 1,
      personalNotes: `透過 Google 智慧搜店於 ${new Date().toLocaleDateString()} 加入口袋名單`,
      mustEatDishes: [],
      avoidDishes: [],
      videos: [],
      authorFoodieId: (userProfile.foodieId || 'foodie').toLowerCase().trim().replace(/[@#\s]/g, ''),
      authorName: userProfile.name || '熱心吃貨',
      authorAvatar: userProfile.avatar || '👑',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddRestaurant(newRestaurant);
    setAddedIds((prev) => new Set([...prev, place.id]));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔍</span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Google 智慧搜店 · 一鍵直接加入口袋</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.2 rounded-full">
                  免手打超省時
                </span>
              </h2>
              <p className="text-xs text-indigo-200">
                搜尋任何店名、小吃、地標，自動抓取精確座標與地址並即時收錄！
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

        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="輸入餐廳名稱、地標或關鍵字 (例如：台北 隱家拉麵、詹記、鼎泰豐...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border-2 border-indigo-300 focus:outline-hidden focus:border-indigo-600 bg-white font-medium shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isSearching ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>搜尋中...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>搜店</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold shrink-0 text-[11px]">熱門推薦：</span>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSearch(p)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 text-[11px] font-bold shrink-0 transition-all cursor-pointer shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {isSearching ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">正在全球地圖與 Google POI 資料庫中搜店...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>找到 {results.length} 個符合的地點：</span>
                <span className="text-[11px]">點選評分標籤即可 1 秒收錄至我的口袋名單</span>
              </div>

{/* 🌟 Fallback Custom Create Card if specific store isn't listed */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-r from-blue-50/60 via-purple-50/60 to-pink-50/60 flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-black text-indigo-950">
                      想直接建立「{searchQuery}」嗎？
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    若此店為新開幕或特有店家，可直接以這個名稱一鍵收進您的口袋名單！
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const detectedCity = userLocation.cityName || '台北市';
                      const customPlace: PlaceSearchResult = {
                        id: `custom_${Date.now()}`,
                        name: searchQuery.trim(),
                        category: '精選美食',
                        city: detectedCity,
                        address: `${detectedCity} (待補詳細地址)`,
                        lat: userLocation.lat || 25.0478,
                        lng: userLocation.lng || 121.5319,
                        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery + ' ' + detectedCity)}`,
                        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' ' + detectedCity + ' 美食 評價')}`,
                        priceRange: '$',
                        source: 'custom',
                      };
                      handleQuickAdd(customPlace, 'wishlist');
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>一鍵加入口袋</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="在 Google Maps 查詢"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {results.map((place) => {
                const isAdded = addedIds.has(place.id);
                const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng);

                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
                  >
                    {/* Top Row: Store Info & Action Links */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-slate-900">
                            {place.name}
                          </h3>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {place.category} · {place.priceRange}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            📍 {place.city}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{place.address}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono font-black px-2 py-1 rounded-xl bg-slate-100 text-slate-600">
                          {formatDistance(distanceKm, lang)}
                        </span>

                        <a
                          href={place.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="在 Google 地圖中查看"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={place.googleSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          title="在 Google 搜尋食記心得"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Bottom Row: 1-Click Rating & Pocket Add */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <span>🏷️ 一鍵收錄為：</span>
                      </span>

                      {isAdded ? (
                        <div className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
                          <Check className="w-4 h-4" />
                          <span>已成功收進我的口袋名單！</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(place, 'must_eat')}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            <span>🔥 必吃</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAdd(place, 'frequent_visit')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>🔄 常訪</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAdd(place, 'wishlist')}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>📌 待吃口袋</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAdd(place, 'avoid_again')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                            <span>☠️ 避雷</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div className="py-12 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">查無符合「{searchQuery}」的店家</p>
              <p className="text-[11px] text-slate-400">請嘗試簡化名稱（例如：「隱家拉麵」取代完整句子）或搜尋城市名稱</p>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' 美食 推薦')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>直接開啟 Google 搜尋「{searchQuery}」</span>
              </a>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto">
                ✨
              </div>
              <h4 className="text-sm font-black text-slate-800">
                輸入店名或點擊上方推薦關鍵字
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                無需手動切換頁面或複製座標，搜到即可 1 秒直接收藏至個人地圖口袋！
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {addedIds.size > 0 ? `🎉 本次已成功收錄 ${addedIds.size} 間美食至我的口袋！` : '💡 點擊標籤即可即時同步至雲端美食地圖'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95 cursor-pointer"
          >
            完成關閉
          </button>
        </div>

      </div>
    </div>
  );
};
