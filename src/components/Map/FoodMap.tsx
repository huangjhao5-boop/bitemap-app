import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { calculateDistanceKm, formatDistance, type UserLocation } from '../../utils/geo';
import { extractSearchMatch } from '../../utils/searchHelper';
import { 
  Navigation, 
  LocateFixed,
  Crosshair,
  Star, 
  AlertTriangle,
  Share2,
  Edit3,
  MapPin,
  Flame,
  RotateCw,
  Bookmark,
  ThumbsDown,
  Compass,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  List,
  X
} from 'lucide-react';

interface FoodMapProps {
  restaurants: Restaurant[];
  friends: Friend[];
  userLocation: UserLocation;
  searchQuery?: string;
  lang: Language;
  onEditRestaurant: (restaurant: Restaurant) => void;
  onShareRestaurant: (restaurant: Restaurant) => void;
  targetRestaurant?: Restaurant | null;
}

// Category-Based Pin Color & Emoji Dispatcher
function getCategoryPinVisual(category: string, tag: Restaurant['ratingTag']) {
  let bgColor = 'bg-amber-500';
  let emoji = '🥢';
  let ringColor = 'ring-amber-200';

  const cat = (category || '').toLowerCase();
  if (cat.includes('拉麵') || cat.includes('麵') || cat.includes('ramen')) {
    bgColor = 'bg-amber-500';
    emoji = '🍜';
    ringColor = 'ring-amber-300';
  } else if (cat.includes('燒肉') || cat.includes('牛排') || cat.includes('肉') || cat.includes('bbq')) {
    bgColor = 'bg-rose-500';
    emoji = '🥩';
    ringColor = 'ring-rose-300';
  } else if (cat.includes('日料') || cat.includes('壽司') || cat.includes('sushi') || cat.includes('海鮮')) {
    bgColor = 'bg-blue-600';
    emoji = '🍣';
    ringColor = 'ring-blue-300';
  } else if (cat.includes('咖啡') || cat.includes('早午餐') || cat.includes('cafe') || cat.includes('茶')) {
    bgColor = 'bg-emerald-600';
    emoji = '☕';
    ringColor = 'ring-emerald-300';
  } else if (cat.includes('甜點') || cat.includes('蛋糕') || cat.includes('冰') || cat.includes('dessert') || cat.includes('烘焙')) {
    bgColor = 'bg-pink-500';
    emoji = '🍰';
    ringColor = 'ring-pink-300';
  } else if (cat.includes('火鍋') || cat.includes('鍋') || cat.includes('麻辣') || cat.includes('hotpot')) {
    bgColor = 'bg-orange-600';
    emoji = '🍲';
    ringColor = 'ring-orange-300';
  } else if (cat.includes('居酒屋') || cat.includes('酒吧') || cat.includes('酒') || cat.includes('bar')) {
    bgColor = 'bg-purple-600';
    emoji = '🍻';
    ringColor = 'ring-purple-300';
  } else if (cat.includes('披薩') || cat.includes('義式') || cat.includes('pizza') || cat.includes('pasta')) {
    bgColor = 'bg-yellow-600';
    emoji = '🍕';
    ringColor = 'ring-yellow-300';
  } else if (cat.includes('漢堡') || cat.includes('美式') || cat.includes('burger')) {
    bgColor = 'bg-red-500';
    emoji = '🍔';
    ringColor = 'ring-red-300';
  } else {
    bgColor = 'bg-indigo-600';
    emoji = '🥢';
    ringColor = 'ring-indigo-300';
  }

  if (tag === 'avoid_again') {
    bgColor = 'bg-slate-900';
    emoji = '☠️';
    ringColor = 'ring-slate-700';
  }

  return { bgColor, emoji, ringColor };
}

function createCustomPin(restaurant: Restaurant, isSelected: boolean) {
  const { bgColor, emoji, ringColor } = getCategoryPinVisual(restaurant.category, restaurant.ratingTag);
  const selectedClass = isSelected ? 'scale-125 ring-4 ring-amber-400 z-50 shadow-xl' : 'group-hover:scale-110';

  let statusBadge = '';
  if (restaurant.ratingTag === 'must_eat') {
    statusBadge = '<span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-black shadow-xs ring-1 ring-white">👑</span>';
  } else if (restaurant.ratingTag === 'frequent_visit') {
    statusBadge = '<span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-xs ring-1 ring-white">🔄</span>';
  }

  const html = `
    <div class="custom-pin flex flex-col items-center cursor-pointer group">
      <div class="relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl ${bgColor} text-white flex items-center justify-center text-sm sm:text-base shadow-md shadow-slate-900/20 ring-2 ${ringColor} transition-transform ${selectedClass}">
        <span>${emoji}</span>
        ${statusBadge}
      </div>
      <div class="bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md shadow-md border border-slate-200/80 mt-1 whitespace-nowrap max-w-[100px] sm:max-w-[120px] truncate">
        ${restaurant.name}
      </div>
      <div class="w-1.5 h-1.5 bg-slate-800 rounded-full mt-0.5"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [80, 52],
    iconAnchor: [40, 48],
    popupAnchor: [0, -48],
  });
}


// 📍 GPS Locate Me Button — pure HTML button, OUTSIDE MapContainer, always clickable
function LocateMeControl({ 
  userLocation, 
  lang,
  onLocate,
}: { 
  userLocation: UserLocation; 
  lang: Language;
  onLocate: (pos: [number, number]) => void;
}) {
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    setIsLocating(true);
    // Immediately fly to cached location for instant response
    onLocate([userLocation.lat, userLocation.lng]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          onLocate([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLocateMe}
      disabled={isLocating}
      className="absolute top-3 right-3 z-[1000] bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 px-3 py-2 rounded-2xl shadow-xl border-2 border-slate-200 hover:border-blue-400 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
      title="定位至我的現在位置"
    >
      {isLocating ? (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LocateFixed className="w-4 h-4 text-blue-600" />
      )}
      <span>{isLocating ? 'GPS 定位中...' : (lang === 'zh-TW' ? '現在位置' : '現在地')}</span>
    </button>
  );
}

// Inner Leaflet component — flies to position whenever flyToPosition changes
function FlyToLocation({ position, onDone }: { position: [number, number]; onDone: () => void }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(position, 16, { duration: 0.8 });
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [position, map, onDone]);
  return null;
}

function MapViewController({ 
  isSidebarOpen,
}: { 
  isSidebarOpen: boolean;
}) {
  const map = useMap();

  // 📱 Fix Mobile & Responsive Viewport Alignment & Proportions
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map, isSidebarOpen]);

  return null;
}

export const FoodMap: React.FC<FoodMapProps> = ({
  restaurants,
  friends,
  userLocation,
  searchQuery,
  lang,
  onEditRestaurant,
  onShareRestaurant,
  targetRestaurant,
}) => {
  const t = translations[lang];
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    targetRestaurant || null
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);

    // When targetRestaurant changes, fly to it
  useEffect(() => {
    if (targetRestaurant) {
      setSelectedRestaurant(targetRestaurant);
      const lat = Number(targetRestaurant.lat);
      const lng = Number(targetRestaurant.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setFlyToPosition([lat, lng]);
      }
    }
  }, [targetRestaurant]);

  // When restaurants list changes, keep current selected if valid, else select first without moving map
  useEffect(() => {
    if (restaurants.length > 0) {
      setSelectedRestaurant((prev) => {
        if (prev && restaurants.some((r) => r.id === prev.id)) {
          return prev;
        }
        return restaurants[0];
      });
    }
  }, [restaurants]);

  const defaultCenter = useMemo<[number, number]>(() => {
    return [userLocation.lat || 25.0478, userLocation.lng || 121.5319];
  }, []);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    const lat = Number(restaurant.lat);
    const lng = Number(restaurant.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setFlyToPosition([lat, lng]);
    }
    setIsMobileDrawerOpen(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-180px)] min-h-[460px] sm:min-h-[560px] landscape:h-[calc(100vh-130px)] landscape:min-h-[380px] rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-slate-50 flex">
      
      {/* 🖥️ Desktop Collapsible Floating Sidebar (Left Side) */}
      <div
        className={`hidden sm:flex md:flex lg:flex landscape:flex flex-col z-30 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-80 md:w-88 lg:w-96 landscape:w-80' : 'w-0'
        } h-full bg-white border-r border-slate-200 shadow-lg overflow-hidden relative`}
      >
        {isSidebarOpen && (
          <div className="w-80 md:w-88 lg:w-96 landscape:w-80 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <div>
                  <h3 className="text-xs font-black tracking-wide text-white uppercase">
                    {searchQuery ? `🔍 評比搜尋：「${searchQuery}」` : (lang === 'zh-TW' ? '美食店家清單' : 'スポット一覧')}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {lang === 'zh-TW' ? `共 ${restaurants.length} 間命中好店` : `全 ${restaurants.length} 件`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="收合清單"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Restaurant Items */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 divide-y divide-slate-100">
              {restaurants.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                  <p>{lang === 'zh-TW' ? '找不到符合條件的店家' : '該当する店舗がありません'}</p>
                </div>
              ) : (
                restaurants.map((restaurant, idx) => {
                  const isSelected = selectedRestaurant?.id === restaurant.id;
                  const distanceKm = calculateDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    restaurant.lat,
                    restaurant.lng
                  );

                  const { emoji } = getCategoryPinVisual(restaurant.category, restaurant.ratingTag);
                  const matchHighlight = extractSearchMatch(restaurant, searchQuery || '');

                  return (
                    <div
                      key={restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      className={`pt-2 first:pt-0 cursor-pointer transition-all group ${
                        isSelected
                          ? 'bg-amber-50/80 -mx-1 px-3 py-2.5 rounded-2xl ring-2 ring-amber-400 shadow-xs'
                          : 'hover:bg-slate-50 p-2 rounded-xl'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                            <span className="text-xs">{emoji}</span>
                            
                            {restaurant.ratingTag === 'must_eat' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500 text-white flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-current" />
                                <span>{t.tagMustEat}</span>
                              </span>
                            )}
                            {restaurant.ratingTag === 'frequent_visit' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white flex items-center gap-0.5">
                                <RotateCw className="w-2.5 h-2.5" />
                                <span>{t.tagFrequentVisit}</span>
                              </span>
                            )}
                            {restaurant.ratingTag === 'wishlist' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-600 text-white flex items-center gap-0.5">
                                <Bookmark className="w-2.5 h-2.5" />
                                <span>{t.tagWishlist}</span>
                              </span>
                            )}
                            {restaurant.ratingTag === 'avoid_again' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-900 text-rose-300 flex items-center gap-0.5">
                                <ThumbsDown className="w-2.5 h-2.5 text-rose-400" />
                                <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
                              </span>
                            )}

                            <span className="text-[10px] font-bold text-slate-500 truncate">
                              {restaurant.category} · {restaurant.priceRange}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors truncate">
                            {restaurant.name}
                          </h4>
                          {/* Author / Recommender Badge */}
                          {restaurant.authorName && (() => {
                            const isFriend = friends.some(
                              (f) => (f.foodieId || '').toLowerCase() === (restaurant.authorFoodieId || '').toLowerCase()
                            );
                            return (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                isFriend
                                  ? 'text-purple-800 bg-purple-50 border-purple-100'
                                  : 'text-indigo-700 bg-indigo-50 border-indigo-100'
                              }`}>
                                <span>{isFriend ? '👥 好友' : '🌐 社群'} @{restaurant.authorName}</span>
                              </span>
                            );
                          })()}

                          {/* 🎯 Deep Search Match Snippet Highlight */}
                          {matchHighlight && (
                            <div className={`p-1.5 rounded-xl border text-[11px] font-medium space-y-0.5 ${matchHighlight.badgeColor}`}>
                              <span className="font-bold text-[10px] block opacity-80">{matchHighlight.label}</span>
                              <p className="line-clamp-2 leading-tight">"{matchHighlight.snippet}"</p>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{restaurant.address}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                            {formatDistance(distanceKm, lang)}
                          </span>
                          <div className="text-slate-300 group-hover:text-amber-600 flex justify-end">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ Desktop Expand Button (When sidebar is collapsed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hidden sm:flex md:flex lg:flex landscape:flex absolute top-4 left-4 z-30 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-slate-700 items-center gap-1.5 text-xs font-bold transition-transform active:scale-95 animate-fadeIn"
        >
          <List className="w-4 h-4 text-amber-400" />
          <span>{lang === 'zh-TW' ? `展開店家清單 (${restaurants.length})` : `店舗一覧を表示 (${restaurants.length})`}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 🗺️ Main Full-Viewport Leaflet Map */}
      <div className="flex-1 h-full w-full min-w-0 relative z-10 overflow-hidden">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full" style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController isSidebarOpen={isSidebarOpen} />

          {/* 🔵 User Current GPS Pulsing Location Radar */}
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              html: `
                <div class="relative flex items-center justify-center">
                  <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
                  <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg ring-2 ring-blue-300"></div>
                </div>
              `,
              className: '',
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          >
            <Popup>
              <div className="p-1 text-center font-black text-xs text-slate-800">
                📍 您的現在位置
              </div>
            </Popup>
          </Marker>

          {/* FlyTo executor — inside MapContainer so useMap() works */}
          {flyToPosition && (
            <FlyToLocation position={flyToPosition} onDone={() => setFlyToPosition(null)} />
          )}

          {restaurants.map((restaurant) => {
            const isSelected = selectedRestaurant?.id === restaurant.id;
            const googleMapsSearchUrl =
              restaurant.googleMapsUrl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                restaurant.name + ' ' + restaurant.address
              )}`;

            const recommender = friends.find((f) =>
              restaurant.recommendedByFriendIds?.includes(f.id)
            );

            const lat = Number(restaurant.lat) || 25.033;
            const lng = Number(restaurant.lng) || 121.5654;

            return (
              <Marker
                key={restaurant.id}
                position={[lat, lng]}
                icon={createCustomPin(restaurant, isSelected)}
                eventHandlers={{
                  click: () => {
                    setSelectedRestaurant(restaurant);
                  },
                }}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="p-1 space-y-2 text-slate-800">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {restaurant.category} · {restaurant.priceRange}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {t.visitCount} {restaurant.visitCount} {t.timesUnit}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base leading-tight text-slate-900">
                        {restaurant.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {restaurant.address}
                      </p>
                    </div>

                                                            {(restaurant.authorName || recommender) && (() => {
                      const authorId = (restaurant.authorFoodieId || '').toLowerCase().trim();
                      const isFriend = friends.some((f) => (f.foodieId || '').toLowerCase().trim() === authorId);
                      const displayName = restaurant.authorName || (recommender?.customNickname ? `${recommender.customNickname} (${recommender.name})` : recommender?.name);
                      return (
                        <div className={`text-[11px] p-2 rounded-xl border font-bold flex items-center gap-1.5 shadow-2xs ${
                          isFriend 
                            ? 'text-purple-900 bg-purple-50 border-purple-200' 
                            : 'text-indigo-900 bg-indigo-50 border-indigo-200'
                        }`}>
                          <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                            {(() => {
                              const av = restaurant.authorAvatar || recommender?.avatar;
                              if (av && (av.startsWith('data:') || av.startsWith('http') || av.length > 20)) {
                                return <img src={av} alt="avatar" className="w-full h-full object-cover" />;
                              }
                              return <span>{av || '🥢'}</span>;
                            })()}
                          </div>
                          <span className="truncate">
                            {isFriend ? '👥 好友' : '🌐 社群吃貨'}【{displayName}】分享
                          </span>
                        </div>
                      );
                    })()}

                    {/* Must-Eat Dishes */}
                    {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                        <span className="text-[10px] font-bold text-amber-900 block mb-1 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{t.mustEatDishesTitle}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.mustEatDishes.map((dish, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avoid Dishes */}
                    {restaurant.avoidDishes && restaurant.avoidDishes.length > 0 && (
                      <div className="bg-rose-50 p-2 rounded-lg border border-rose-200/60">
                        <span className="text-[10px] font-bold text-rose-900 block mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>{t.avoidDishesTitle}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.avoidDishes.map((dish, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-rose-100 text-rose-900 px-1.5 py-0.2 rounded line-through"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <a
                        href={googleMapsSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{t.googleMapsNav}</span>
                      </a>

                      <button
                        onClick={() => onShareRestaurant(restaurant)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title={t.shareText}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditRestaurant(restaurant)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title={t.editSpot}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* 📍 GPS Locate Me button - absolute overlay on top of map, outside MapContainer */}
        <LocateMeControl userLocation={userLocation} lang={lang} onLocate={setFlyToPosition} />

        {/* 📱 Mobile Floating Bottom Quick Card */}
        <div className="lg:hidden absolute bottom-3 inset-x-3 z-30 space-y-2">
          {!isMobileDrawerOpen ? (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl active:scale-95 transition-all"
                >
                  <List className="w-3.5 h-3.5 text-amber-600" />
                  <span>{searchQuery ? `🔍 評比清單 (${restaurants.length})` : `📋 查看全部清單 (${restaurants.length})`}</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-500" />
                  <span>{userLocation.cityName || '附近位置'}</span>
                </div>
              </div>

              {selectedRestaurant && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {selectedRestaurant.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        · {selectedRestaurant.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {selectedRestaurant.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      {formatDistance(
                        calculateDistanceKm(
                          userLocation.lat,
                          userLocation.lng,
                          selectedRestaurant.lat,
                          selectedRestaurant.lng
                        ),
                        lang
                      )}
                    </span>
                    <a
                      href={
                        selectedRestaurant.googleMapsUrl ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          selectedRestaurant.name + ' ' + selectedRestaurant.address
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs"
                      title="Google Maps 導航"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[65vh] flex flex-col overflow-hidden animate-fadeIn">
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <List className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black">
                    {searchQuery ? `🔍 評比搜尋：「${searchQuery}」` : `美食店家清單 (${restaurants.length} 間)`}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
                {restaurants.map((restaurant) => {
                  const isSelected = selectedRestaurant?.id === restaurant.id;
                  const distanceKm = calculateDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    restaurant.lat,
                    restaurant.lng
                  );

                  const matchHighlight = extractSearchMatch(restaurant, searchQuery || '');

                  return (
                    <div
                      key={restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      className={`pt-2 first:pt-0 p-2 rounded-xl transition-all ${
                        isSelected ? 'bg-amber-50 ring-2 ring-amber-400' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {restaurant.name}
                          </h4>
                          {matchHighlight && (
                            <p className="text-[10px] text-amber-800 line-clamp-1 font-medium">
                              {matchHighlight.label}：{matchHighlight.snippet}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500 truncate">
                            {restaurant.address}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                          {formatDistance(distanceKm, lang)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
