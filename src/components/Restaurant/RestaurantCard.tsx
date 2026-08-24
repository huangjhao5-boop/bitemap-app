import React from 'react';
import type { Restaurant, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { parseVideoUrl } from '../../utils/videoParser';
import { extractSearchMatch } from '../../utils/searchHelper';
import { 
  Flame, 
  RotateCw, 
  Bookmark, 
  ThumbsDown, 
  MapPin, 
  Star, 
  AlertTriangle, 
  Navigation, 
  Share2, 
  Edit3, 
  Trash2, 
  Plus,
  Play
} from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  friends: Friend[];
  searchQuery?: string;
  lang: Language;
  onIncrementVisit: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
  onShare: (restaurant: Restaurant) => void;
  onLocateOnMap: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  friends,
  searchQuery,
  lang,
  onIncrementVisit,
  onEdit,
  onDelete,
  onShare,
  onLocateOnMap,
}) => {
  const t = translations[lang];
  const matchHighlight = extractSearchMatch(restaurant, searchQuery || '');

  const recommender = friends.find((f) =>
    restaurant.recommendedByFriendIds?.includes(f.id)
  );

  return (
    <div className="bg-white clean-card-shadow rounded-3xl overflow-hidden border border-slate-200/80 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
      <div>
        {/* Cover Image or Aesthetic Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          {restaurant.coverImage ? (
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🥢
            </div>
          )}

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {restaurant.ratingTag === 'must_eat' && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs flex items-center gap-1 shadow-md">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{t.tagMustEat}</span>
              </span>
            )}
            {restaurant.ratingTag === 'frequent_visit' && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-md">
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t.tagFrequentVisit}</span>
              </span>
            )}
            {restaurant.ratingTag === 'wishlist' && (
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-xs flex items-center gap-1 shadow-md">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t.tagWishlist}</span>
              </span>
            )}
            {restaurant.ratingTag === 'avoid_again' && (
              <span className="px-2.5 py-1 rounded-full bg-slate-900 text-rose-300 font-black text-xs flex items-center gap-1 shadow-md">
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 font-black text-xs shadow-xs border border-slate-200">
              {restaurant.category} · {restaurant.priceRange}
            </span>
          </div>

          <button
            onClick={() => onShare(restaurant)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-transform active:scale-90"
            title="分享小卡"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{restaurant.city} · {restaurant.address}</span>
            </p>
          </div>

          {/* 🎯 Deep Search Match Snippet (If searching for e.g. "紅茶", "布丁", "和牛") */}
          {matchHighlight && (
            <div className={`p-2.5 rounded-2xl border text-xs font-medium space-y-1 ${matchHighlight.badgeColor}`}>
              <span className="font-extrabold text-[10px] block opacity-80">{matchHighlight.label}</span>
              <p className="line-clamp-2 leading-relaxed">"{matchHighlight.snippet}"</p>
            </div>
          )}

          {/* Personal Review Notes */}
          {restaurant.personalNotes && !matchHighlight && (
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs text-slate-600 line-clamp-2 italic">
              "{restaurant.personalNotes}"
            </div>
          )}

          {/* Visit Count Badge & Recommender */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => onIncrementVisit(restaurant.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold border border-slate-200 transition-all active:scale-95"
              title="點擊造訪次數 +1"
            >
              <span>{t.visitCount}: {restaurant.visitCount || 0} {t.timesUnit}</span>
              <Plus className="w-3 h-3 text-slate-500" />
            </button>

            {recommender && (
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                {recommender.avatar} {recommender.name} 推薦
              </span>
            )}
          </div>

          {/* Must Eat Dishes */}
          {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
            <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/50 space-y-1 text-xs">
              <span className="font-black text-amber-900 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{t.mustEatDishesTitle}</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {restaurant.mustEatDishes.map((dish, i) => (
                  <span
                    key={i}
                    className="bg-white text-amber-950 font-bold px-2 py-0.5 rounded-lg border border-amber-200/60 text-[11px]"
                  >
                    🌟 {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Avoid Dishes */}
          {restaurant.avoidDishes && restaurant.avoidDishes.length > 0 && (
            <div className="bg-rose-50/70 p-2 rounded-2xl border border-rose-200/50 space-y-1 text-xs">
              <span className="font-black text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>{t.avoidDishesTitle}</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {restaurant.avoidDishes.map((dish, i) => (
                  <span
                    key={i}
                    className="bg-white text-rose-900 font-bold px-2 py-0.5 rounded-lg border border-rose-200 text-[11px] line-through"
                  >
                    ❌ {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Pill */}
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
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-rose-500 fill-current" />
                      <span>{vid.title || parsed.displayLabel}</span>
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${parsed.badgeBg}`}>
                      {parsed.displayLabel}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          onClick={() => onLocateOnMap(restaurant)}
          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'zh-TW' ? '在地圖上查看' : 'マップで確認'}</span>
        </button>

        <a
          href={
            restaurant.googleMapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              restaurant.name + ' ' + restaurant.address
            )}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          title="Google Maps 導航"
        >
          <Navigation className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => onEdit(restaurant)}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
          title="編輯"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(restaurant.id)}
          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors"
          title="刪除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
