import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { calculateDistanceKm, formatDistance, type UserLocation } from '../../utils/geo';
import { parseVideoUrl } from '../../utils/videoParser';
import { 
  Navigation, 
  Calendar, 
  Star, 
  AlertTriangle,
  ExternalLink,
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
  lang: Language;
  onEditRestaurant: (restaurant: Restaurant) => void;
  onShareRestaurant: (restaurant: Restaurant) => void;
  targetRestaurant?: Restaurant | null;
}

function createCustomPin(tag: Restaurant['ratingTag'], name: string, isSelected: boolean) {
  let bgColor = 'bg-slate-700';
  let emoji = '🍴';
  let ringColor = 'ring-slate-400';

  switch (tag) {
    case 'must_eat':
      bgColor = 'bg-rose-500';
      emoji = '🔥';
      ringColor = 'ring-rose-300';
      break;
    case 'frequent_visit':
      bgColor = 'bg-emerald-600';
      emoji = '🔄';
      ringColor = 'ring-emerald-300';
      break;
    case 'avoid_again':
      bgColor = 'bg-slate-950';
      emoji = '☠️';
      ringColor = 'ring-rose-600';
      break;
    case 'wishlist':
      bgColor = 'bg-indigo-600';
      emoji = '📌';
      ringColor = 'ring-indigo-300';
      break;
    default:
      bgColor = 'bg-slate-600';
      emoji = '😐';
      ringColor = 'ring-slate-300';
      break;
  }

  const selectedClass = isSelected ? 'scale-125 ring-4 ring-amber-400 z-50' : 'group-hover:scale-110';

  const html = `
    <div class="custom-pin flex flex-col items-center cursor-pointer group">
      <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl ${bgColor} text-white flex items-center justify-center text-sm sm:text-base shadow-lg shadow-black/30 ring-2 ${ringColor} transition-transform ${selectedClass}">
        <span>${emoji}</span>
      </div>
      <div class="bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md shadow-md border border-slate-200 mt-1 whitespace-nowrap max-w-[100px] sm:max-w-[120px] truncate">
        ${name}
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

function MapViewController({ 
  selectedSpot 
}: { 
  selectedSpot?: Restaurant | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedSpot) {
      map.flyTo([selectedSpot.lat, selectedSpot.lng], 16, { 
        duration: 0.8,
        easeLinearity: 0.25 
      });
    }
  }, [selectedSpot, map]);

  return null;
}

export const FoodMap: React.FC<FoodMapProps> = ({
  restaurants,
  friends,
  userLocation,
  lang,
  onEditRestaurant,
  onShareRestaurant,
  targetRestaurant,
}) => {
  const t = translations[lang];
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    targetRestaurant || (restaurants.length > 0 ? restaurants[0] : null)
  );

  // Desktop sidebar collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mobile bottom drawer state: 'collapsed' (bottom bar) vs 'expanded' (full list)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (targetRestaurant) {
      setSelectedRestaurant(targetRestaurant);
    }
  }, [targetRestaurant]);

  // Sort list by distance relative to current user location
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return distA - distB;
  });

  const defaultCenter: [number, number] = [userLocation.lat, userLocation.lng];

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    // On mobile, collapse the drawer after selection so user sees the map
    setIsMobileDrawerOpen(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-210px)] min-h-[520px] sm:min-h-[600px] rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex">
      
      {/* 🖥️ Desktop Collapsible Floating Sidebar (Left Side) */}
      <div
        className={`hidden lg:flex flex-col z-30 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-88 sm:w-96' : 'w-0'
        } h-full bg-white/95 backdrop-blur-md border-r border-slate-200 shadow-xl overflow-hidden relative`}
      >
        {isSidebarOpen && (
          <div className="w-88 sm:w-96 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <div>
                  <h3 className="text-xs font-black tracking-wide text-white uppercase">
                    {lang === 'zh-TW' ? '美食店家清單' : 'スポット一覧'}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {lang === 'zh-TW' ? `共 ${restaurants.length} 間 · 依距離由近到遠` : `全 ${restaurants.length} 件 · 距離順`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="收合清單以獲得全螢幕地圖"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Restaurant Items */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 divide-y divide-slate-100/60">
              {sortedRestaurants.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                  <p>{lang === 'zh-TW' ? '找不到符合條件的店家' : '該当する店舗がありません'}</p>
                </div>
              ) : (
                sortedRestaurants.map((restaurant) => {
                  const isSelected = selectedRestaurant?.id === restaurant.id;
                  const distanceKm = calculateDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    restaurant.lat,
                    restaurant.lng
                  );

                  return (
                    <div
                      key={restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      className={`pt-2 first:pt-0 cursor-pointer transition-all group ${
                        isSelected
                          ? 'bg-indigo-50/90 -mx-1 px-3 py-2 rounded-2xl ring-2 ring-indigo-500 shadow-sm'
                          : 'hover:bg-slate-50 p-2 rounded-xl'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            {restaurant.ratingTag === 'must_eat' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white flex items-center gap-0.5">
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
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white flex items-center gap-0.5">
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
                              {restaurant.category}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors truncate">
                            {restaurant.name}
                          </h4>

                          <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{restaurant.address}</span>
                          </p>

                          {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {restaurant.mustEatDishes.slice(0, 2).map((dish, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded"
                                >
                                  🌟 {dish}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {formatDistance(distanceKm, lang)}
                          </span>
                          <div className="text-slate-300 group-hover:text-indigo-600 flex justify-end">
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
          className="hidden lg:flex absolute top-4 left-4 z-30 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-slate-700 items-center gap-1.5 text-xs font-bold transition-transform active:scale-95 animate-fadeIn"
        >
          <List className="w-4 h-4 text-rose-400" />
          <span>{lang === 'zh-TW' ? `展開店家清單 (${restaurants.length})` : `店舗一覧を表示 (${restaurants.length})`}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 🗺️ Main Full-Viewport Leaflet Map */}
      <div className="flex-1 h-full w-full relative z-10">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController selectedSpot={selectedRestaurant} />

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

            return (
              <Marker
                key={restaurant.id}
                position={[restaurant.lat, restaurant.lng]}
                icon={createCustomPin(restaurant.ratingTag, restaurant.name, isSelected)}
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
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
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

                    {restaurant.lastVisitedDate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{t.lastVisited}：{restaurant.lastVisitedDate}</span>
                      </div>
                    )}

                    {recommender && (
                      <div className="text-[11px] text-purple-800 bg-purple-50 p-1.5 rounded-lg border border-purple-100 font-medium">
                        <span>{recommender.avatar} {recommender.name} {t.friendRecommendedCount}</span>
                      </div>
                    )}

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

                    {/* Videos */}
                    {restaurant.videos && restaurant.videos.length > 0 && (
                      <div className="space-y-1">
                        {restaurant.videos.map((vid) => {
                          const parsed = parseVideoUrl(vid.url);
                          return (
                            <a
                              key={vid.id}
                              href={vid.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-[11px] p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                            >
                              <span className="truncate max-w-[180px]">
                                🎬 {vid.title || parsed.displayLabel}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                          );
                        })}
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
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
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

        {/* 📱 Mobile Floating Bottom Quick Card / Expandable Drawer */}
        <div className="lg:hidden absolute bottom-3 inset-x-3 z-30 space-y-2">
          {/* Collapsed Mode: Sleek Floating Card of Selected Spot + List Opener Button */}
          {!isMobileDrawerOpen ? (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100 active:scale-95 transition-all"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{lang === 'zh-TW' ? `📋 查看全部清單 (${restaurants.length})` : `📋 一覧を開く (${restaurants.length})`}</span>
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
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800">
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
            /* Expanded Mode: Full Slide-up Drawer List on Mobile */
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[65vh] flex flex-col overflow-hidden animate-fadeIn">
              <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <List className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-black">
                    {lang === 'zh-TW' ? `美食店家清單 (${restaurants.length} 間)` : `店舗一覧 (${restaurants.length} 件)`}
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
                {sortedRestaurants.map((restaurant) => {
                  const isSelected = selectedRestaurant?.id === restaurant.id;
                  const distanceKm = calculateDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    restaurant.lat,
                    restaurant.lng
                  );

                  return (
                    <div
                      key={restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      className={`pt-2 first:pt-0 p-2 rounded-xl transition-all ${
                        isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {restaurant.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {restaurant.address}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 shrink-0">
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

        {/* Map Legend Floating Box (Desktop Only) */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-md border border-slate-200 text-[11px] hidden sm:block">
          <span className="font-extrabold text-slate-800 block mb-1">{t.mapLegendTitle}</span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 font-medium">{t.tagMustEat}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-slate-600 font-medium">{t.tagFrequentVisit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              <span className="text-slate-600 font-medium">{t.tagAvoidAgain}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
