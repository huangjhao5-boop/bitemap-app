import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Restaurant } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { calculateDistanceKm, formatDistance, type UserLocation } from '../../utils/geo';
import { parseVideoUrl } from '../../utils/videoParser';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Navigation, 
  MapPin, 
  Star, 
  Share2,
  Compass,
  Play
} from 'lucide-react';

interface ReelsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  userLocation: UserLocation;
  lang: Language;
  onShareRestaurant: (restaurant: Restaurant) => void;
  onLocateOnMap: (restaurant: Restaurant) => void;
}

export const ReelsFeedModal: React.FC<ReelsFeedModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  userLocation,
  lang,
  onShareRestaurant,
  onLocateOnMap,
}) => {
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch gesture tracking for mobile swipe up/down
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const lastWheelTime = useRef<number>(0);

  // Flatten all videos and sort strictly by distance from current user location!
  const sortedReelItems = useMemo(() => {
    const items: {
      restaurant: Restaurant;
      video: Restaurant['videos'][0];
      distanceKm: number;
    }[] = [];

    restaurants.forEach((r) => {
      const distance = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        r.lat,
        r.lng
      );

      if (r.videos && r.videos.length > 0) {
        r.videos.forEach((vid) => {
          items.push({
            restaurant: r,
            video: vid,
            distanceKm: distance,
          });
        });
      } else {
        items.push({
          restaurant: r,
          video: {
            id: 'placeholder_' + r.id,
            platform: 'other',
            url: r.googleMapsUrl || '',
            title: `${r.name} · ${r.category}`,
          },
          distanceKm: distance,
        });
      }
    });

    return items.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [restaurants, userLocation]);

  const handleNext = useCallback(() => {
    if (sortedReelItems.length === 0) return;
    setCurrentIndex((prev) => (prev < sortedReelItems.length - 1 ? prev + 1 : 0));
  }, [sortedReelItems.length]);

  const handlePrev = useCallback(() => {
    if (sortedReelItems.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sortedReelItems.length - 1));
  }, [sortedReelItems.length]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Touch Swipe Handlers for Mobile (Swipe up = next, Swipe down = prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchEndY.current === null) return;
    const distance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 45; // 45px swipe threshold

    if (distance > minSwipeDistance) {
      // Swiped UP -> Next video!
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped DOWN -> Previous video!
      handlePrev();
    }

    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Mouse Wheel / Trackpad Scroll Handler (Debounced)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 400) return; // 400ms cooldown

    if (e.deltaY > 25) {
      lastWheelTime.current = now;
      handleNext();
    } else if (e.deltaY < -25) {
      lastWheelTime.current = now;
      handlePrev();
    }
  };

  if (!isOpen || sortedReelItems.length === 0) return null;

  const currentItem = sortedReelItems[currentIndex];
  const { restaurant, video, distanceKm } = currentItem;
  const parsedVideo = parseVideoUrl(video.url);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 animate-fadeIn select-none touch-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Phone container mockup */}
      <div className="relative w-full sm:max-w-md h-full sm:h-[92vh] sm:max-h-[820px] bg-slate-950 sm:rounded-[36px] overflow-hidden shadow-2xl border-0 sm:border border-slate-800 flex flex-col justify-between text-white">
        
        {/* Top Floating Control Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="px-2.5 py-1 rounded-full bg-rose-500 text-[11px] font-black text-white flex items-center gap-1 shadow-md">
              <Play className="w-3 h-3 fill-current" />
              <span>{lang === 'zh-TW' ? '短影音探店流' : 'ショート動画'}</span>
            </div>

            {/* Distance Badge relative to user */}
            <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>{lang === 'zh-TW' ? `距離您 ${formatDistance(distanceKm, lang)}` : `現在地から ${formatDistance(distanceKm, lang)}`}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Card Visual Content Area */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-slate-900">
          {restaurant.coverImage ? (
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 filter blur-xs transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950" />
          )}

          {/* Center Interactive Preview Card */}
          <div className="relative z-10 p-6 text-center space-y-4 max-w-xs animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-4xl shadow-xl ring-4 ring-white/20">
              🥢
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${parsedVideo.badgeBg}`}>
                {parsedVideo.displayLabel}
              </span>
              <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                {restaurant.name}
              </h3>
              <p className="text-xs text-slate-300 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{restaurant.city} · {restaurant.category}</span>
              </p>
            </div>

            {/* Direct Watch Button */}
            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-rose-900/40 transition-transform active:scale-95 pointer-events-auto"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'zh-TW' ? '觀看短影音介紹' : '動画を再生する'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <p className="text-[11px] text-white/50 pt-2 animate-pulse">
              {lang === 'zh-TW' ? '👆 上下滑動 / 滾輪 切換下一間' : '👆 スワイプで次の動画へ'}
            </p>
          </div>

          {/* Right Floating Quick Action Buttons */}
          <div className="absolute right-3.5 bottom-32 z-30 flex flex-col gap-3 pointer-events-auto">
            <button
              onClick={() => onShareRestaurant(restaurant)}
              className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center border border-white/20 shadow-lg transition-transform active:scale-90"
              title={t.shareText}
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                onLocateOnMap(restaurant);
                onClose();
              }}
              className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md hover:bg-white/20 text-indigo-300 flex items-center justify-center border border-white/20 shadow-lg transition-transform active:scale-90"
              title={lang === 'zh-TW' ? '在地圖上查看' : 'マップで見る'}
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Details Drawer */}
        <div className="relative z-30 p-4 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent space-y-3 border-t border-white/10 pointer-events-auto">
          {/* Must-Eat Dishes Highlights */}
          {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-xs space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>{t.mustEatDishesTitle}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {restaurant.mustEatDishes.map((dish, i) => (
                  <span
                    key={i}
                    className="bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row & Nav Arrows */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <a
              href={restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.googleMapsNav}</span>
            </a>

            {/* Up / Down feed navigators */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors active:scale-90"
                title="上一則 (向上滑動)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-slate-300">
                {currentIndex + 1}/{sortedReelItems.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors active:scale-90"
                title="下一則 (向下滑動)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
