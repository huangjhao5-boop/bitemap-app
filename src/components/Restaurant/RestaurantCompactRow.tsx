import React from 'react';
import type { Restaurant, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { extractSearchMatch } from '../../utils/searchHelper';
import { 
  Flame, 
  RotateCw, 
  Bookmark, 
  ThumbsDown, 
  MapPin, 
  Navigation, 
  Share2, 
  Edit3, 
  Trash2, 
  Plus
} from 'lucide-react';

interface RestaurantCompactRowProps {
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

function getCategoryBadge(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('拉麵') || cat.includes('麵') || cat.includes('ramen')) return { emoji: '🍜', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
  if (cat.includes('燒肉') || cat.includes('牛排') || cat.includes('肉') || cat.includes('bbq')) return { emoji: '🥩', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
  if (cat.includes('日料') || cat.includes('壽司') || cat.includes('sushi') || cat.includes('海鮮')) return { emoji: '🍣', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
  if (cat.includes('咖啡') || cat.includes('早午餐') || cat.includes('cafe')) return { emoji: '☕', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  if (cat.includes('甜點') || cat.includes('蛋糕') || cat.includes('冰') || cat.includes('dessert')) return { emoji: '🍰', bg: 'bg-pink-100 text-pink-900 border-pink-300' };
  if (cat.includes('火鍋') || cat.includes('鍋') || cat.includes('麻辣') || cat.includes('hotpot')) return { emoji: '🍲', bg: 'bg-orange-100 text-orange-900 border-orange-300' };
  if (cat.includes('居酒屋') || cat.includes('酒吧') || cat.includes('酒')) return { emoji: '🍻', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
  if (cat.includes('披薩') || cat.includes('義式') || cat.includes('pizza')) return { emoji: '🍕', bg: 'bg-yellow-100 text-yellow-900 border-yellow-300' };
  if (cat.includes('漢堡') || cat.includes('美式') || cat.includes('burger')) return { emoji: '🍔', bg: 'bg-red-100 text-red-900 border-red-300' };
  return { emoji: '🥢', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
}

export const RestaurantCompactRow: React.FC<RestaurantCompactRowProps> = ({
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
  const recommender = friends.find((f) => restaurant.recommendedByFriendIds?.includes(f.id));
  const catBadge = getCategoryBadge(restaurant.category);

  return (
    <div className="bg-white hover:bg-amber-50/20 rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 group w-full">
      {/* Left: Emoji + Rating Indicator + Basic Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Visual Category Emoji */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${catBadge.bg}`}>
          {catBadge.emoji}
        </div>

        {/* Store Name & Quick Info */}
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              {restaurant.name}
            </h4>

            {restaurant.ratingTag === 'must_eat' && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white font-black text-[9px] flex items-center gap-0.5 shadow-2xs shrink-0">
                <Flame className="w-2.5 h-2.5 fill-current" />
                <span>{t.tagMustEat}</span>
              </span>
            )}
            {restaurant.ratingTag === 'frequent_visit' && (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-black text-[9px] flex items-center gap-0.5 shadow-2xs shrink-0">
                <RotateCw className="w-2.5 h-2.5" />
                <span>{t.tagFrequentVisit}</span>
              </span>
            )}
            {restaurant.ratingTag === 'wishlist' && (
              <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white font-black text-[9px] flex items-center gap-0.5 shadow-2xs shrink-0">
                <Bookmark className="w-2.5 h-2.5" />
                <span>{t.tagWishlist}</span>
              </span>
            )}
            {restaurant.ratingTag === 'avoid_again' && (
              <span className="px-1.5 py-0.2 rounded-md bg-slate-900 text-rose-300 font-black text-[9px] flex items-center gap-0.5 shadow-2xs shrink-0">
                <ThumbsDown className="w-2.5 h-2.5 text-rose-400" />
                <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
              </span>
            )}

            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
              {restaurant.category} · {restaurant.priceRange}
            </span>

            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
              <span>{restaurant.city}</span>
            </span>
          </div>

          {/* Keywords List (Must-Eat & Avoid) */}
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            {restaurant.mustEatDishes?.map((dish, i) => (
              <span key={i} className="bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.2 rounded font-bold">
                🌟 {dish}
              </span>
            ))}
            {restaurant.avoidDishes?.map((dish, i) => (
              <span key={i} className="bg-rose-50 text-rose-900 border border-rose-200/80 px-1.5 py-0.2 rounded font-bold line-through">
                ❌ {dish}
              </span>
            ))}
            {recommender && (
              <span className="text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100 font-bold flex items-center gap-1">
                <div className="w-3 h-3 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  {recommender.avatar && (recommender.avatar.startsWith('data:') || recommender.avatar.startsWith('http') || recommender.avatar.length > 20) ? (
                    <img src={recommender.avatar} alt={recommender.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{recommender.avatar || '🥢'}</span>
                  )}
                </div>
                <span>{recommender.customNickname ? `${recommender.customNickname} (${recommender.name})` : recommender.name}</span>
              </span>
            )}
            {matchHighlight && (
              <span className={`px-1.5 py-0.2 rounded font-bold border ${matchHighlight.badgeColor}`}>
                🔍 "{matchHighlight.snippet}"
              </span>
            )}
            {restaurant.personalNotes && !matchHighlight && (
              <span className="text-slate-500 italic truncate max-w-[220px]">
                "{restaurant.personalNotes}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-end pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
        <button
          onClick={() => onLocateOnMap(restaurant)}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>在地圖查看</span>
        </button>

        <button
          onClick={() => onIncrementVisit(restaurant.id)}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center gap-0.5"
          title="造訪次數 +1"
        >
          <span>{restaurant.visitCount || 0}次</span>
          <Plus className="w-3 h-3 text-slate-400" />
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
          className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
          title="Google Maps 導航"
        >
          <Navigation className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => onShare(restaurant)}
          className="p-1.5 rounded-xl hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
          title="分享小卡"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onEdit(restaurant)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="編輯"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(restaurant.id)}
          className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          title="刪除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
