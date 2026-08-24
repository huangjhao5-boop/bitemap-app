import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Flame,
  RotateCw,
  Bookmark,
  ThumbsDown,
  Compass,
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
      <div class="w-9 h-9 rounded-2xl ${bgColor} text-white flex items-center justify-center text-base shadow-lg shadow-black/30 ring-2 ${ringColor} transition-transform ${selectedClass}">
        <span>${emoji}</span>
      </div>
      <div class="bg-white/95 backdrop-blur-xs text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-md shadow-md border border-slate-200 mt-1 whitespace-nowrap max-w-[120px] truncate">
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
  selectedSpot?: Restaurant | null 
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedSpot) {
      map.flyTo([selectedSpot.lat, selectedSpot.lng], 16, { 
        duration: 0.9,
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

  const sidebarListRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-230px)] min-h-[580px] w-full">
      {/* 📋 Left Interactive Sidebar List (Smooth sync with Map!) */}
      <div className="w-full lg:w-96 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <div>
              <h3 className="text-xs font-black tracking-wide text-white uppercase">
                {lang === 'zh-TW' ? '美食店家快速清單' : 'スポット一覧'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'zh-TW' ? `共 ${restaurants.length} 間 · 依距離由近到遠` : `全 ${restaurants.length} 件 · 距離順`}
              </p>
            </div>
          </div>

          <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-bold text-amber-300 border border-white/10 flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-400" />
            <span>{userLocation.cityName || (userLocation.isGps ? 'GPS 定位中' : '目前位置')}</span>
          </div>
        </div>

        {/* Scrollable Restaurant Items */}
        <div ref={sidebarListRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100/60">
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
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className={`pt-2.5 first:pt-0 cursor-pointer transition-all group ${
                    isSelected
                      ? 'bg-indigo-50/90 -mx-1 px-3 py-2.5 rounded-2xl ring-2 ring-indigo-500 shadow-sm'
                      : 'hover:bg-slate-50 p-2 rounded-xl'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Rating Tag Pill */}
                        {restaurant.ratingTag === 'must_eat' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-0.5 shadow-2xs">
                            <Flame className="w-3 h-3 fill-current" />
                            <span>{t.tagMustEat}</span>
                          </span>
                        )}
                        {restaurant.ratingTag === 'frequent_visit' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-0.5 shadow-2xs">
                            <RotateCw className="w-3 h-3" />
                            <span>{t.tagFrequentVisit}</span>
                          </span>
                        )}
                        {restaurant.ratingTag === 'wishlist' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-0.5 shadow-2xs">
                            <Bookmark className="w-3 h-3" />
                            <span>{t.tagWishlist}</span>
                          </span>
                        )}
                        {restaurant.ratingTag === 'avoid_again' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-rose-300 flex items-center gap-0.5 shadow-2xs">
                            <ThumbsDown className="w-3 h-3 text-rose-400" />
                            <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-slate-500">
                          {restaurant.category} · {restaurant.priceRange}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {restaurant.name}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{restaurant.address}</span>
                      </p>

                      {/* Must Eat Dishes badges */}
                      {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {restaurant.mustEatDishes.slice(0, 2).map((dish, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md"
                            >
                              🌟 {dish}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Distance Badge & Direction Arrow */}
                    <div className="text-right shrink-0 space-y-1">
                      <span className="inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {formatDistance(distanceKm, lang)}
                      </span>
                      <div className="text-slate-300 group-hover:text-indigo-600 flex justify-end transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🗺️ Right Interactive Map Panel */}
      <div className="flex-1 h-full rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full z-10"
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
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-1 space-y-2.5 text-slate-800">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {restaurant.category} · {restaurant.priceRange}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {t.visitCount} {restaurant.visitCount} {t.timesUnit}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base leading-tight text-slate-900">
                        {restaurant.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {restaurant.address}
                      </p>
                    </div>

                    {restaurant.lastVisitedDate && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.lastVisited}：{restaurant.lastVisitedDate}</span>
                      </div>
                    )}

                    {recommender && (
                      <div className="text-xs text-purple-800 bg-purple-50 p-1.5 rounded-lg border border-purple-100 font-medium">
                        <span>{recommender.avatar} {recommender.name} {t.friendRecommendedCount}</span>
                      </div>
                    )}

                    {/* Must-Eat Dishes */}
                    {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                        <span className="text-[11px] font-bold text-amber-900 block mb-1 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{t.mustEatDishesTitle}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.mustEatDishes.map((dish, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded"
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
                        <span className="text-[11px] font-bold text-rose-900 block mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>{t.avoidDishesTitle}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.avoidDishes.map((dish, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded line-through"
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
                              className="flex items-center justify-between text-xs p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
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
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
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

        {/* Map Legend Floating Box */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200/80 text-xs hidden sm:block">
          <span className="font-extrabold text-slate-800 block mb-1.5">{t.mapLegendTitle}</span>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 font-medium">{t.tagMustEat}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-slate-600 font-medium">{t.tagFrequentVisit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-900"></span>
              <span className="text-slate-600 font-medium">{t.tagAvoidAgain}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="text-slate-600 font-medium">{t.tagWishlist}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
