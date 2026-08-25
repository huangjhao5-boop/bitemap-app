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

// 🎨 Helper: Get category emoji & style for text-only compact cards
function getCategoryBadge(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('拉麵') || cat.includes('麵') || cat.includes('ramen')) return { emoji: '🍜', color: 'bg-amber-100 text-amber-900 border-amber-300' };
  if (cat.includes('燒肉') || cat.includes('牛排') || cat.includes('肉') || cat.includes('bbq')) return { emoji: '🥩', color: 'bg-rose-100 text-rose-900 border-rose-300' };
  if (cat.includes('日料') || cat.includes('壽司') || cat.includes('sushi') || cat.includes('海鮮')) return { emoji: '🍣', color: 'bg-blue-100 text-blue-900 border-blue-300' };
  if (cat.includes('咖啡') || cat.includes('早午餐') || cat.includes('cafe')) return { emoji: '☕', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  if (cat.includes('甜點') || cat.includes('蛋糕') || cat.includes('冰') || cat.includes('dessert')) return { emoji: '🍰', color: 'bg-pink-100 text-pink-900 border-pink-300' };
  if (cat.includes('火鍋') || cat.includes('鍋') || cat.includes('麻辣') || cat.includes('hotpot')) return { emoji: '🍲', color: 'bg-orange-100 text-orange-900 border-orange-300' };
  if (cat.includes('居酒屋') || cat.includes('酒吧') || cat.includes('酒')) return { emoji: '🍻', color: 'bg-purple-100 text-purple-900 border-purple-300' };
  if (cat.includes('披薩') || cat.includes('義式') || cat.includes('pizza')) return { emoji: '🍕', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' };
  if (cat.includes('漢堡') || cat.includes('美式') || cat.includes('burger')) return { emoji: '🍔', color: 'bg-red-100 text-red-900 border-red-300' };
  return { emoji: '🥢', color: 'bg-slate-100 text-slate-800 border-slate-300' };
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

  const catBadge = getCategoryBadge(restaurant.category);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📑 1. 無圖片時：專屬「橫式緊湊關鍵字卡 (Horizontal Keyword Banner Card)」
  // ═══════════════════════════════════════════════════════════════════════════
  if (!restaurant.coverImage) {
    return (
      <div className="bg-white clean-card-shadow rounded-3xl p-4 border border-slate-200/90 hover:border-amber-400 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3 group relative overflow-hidden">
        {/* Rating Color Top Accent Stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          restaurant.ratingTag === 'must_eat'
            ? 'bg-amber-400'
            : restaurant.ratingTag === 'frequent_visit'
            ? 'bg-emerald-500'
            : restaurant.ratingTag === 'avoid_again'
            ? 'bg-slate-900'
            : 'bg-blue-500'
        }`} />

        <div className="space-y-2.5">
          {/* Header Row: Emoji + Name + Badges + Action Buttons */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Category Icon */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border shadow-2xs ${catBadge.color}`}>
                {catBadge.emoji}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                    {restaurant.name}
                  </h3>

                  {restaurant.ratingTag === 'must_eat' && (
                    <span className="px-2 py-0.2 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center gap-0.5 shadow-2xs">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      <span>{t.tagMustEat}</span>
                    </span>
                  )}
                  {restaurant.ratingTag === 'frequent_visit' && (
                    <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-0.5 shadow-2xs">
                      <RotateCw className="w-2.5 h-2.5" />
                      <span>{t.tagFrequentVisit}</span>
                    </span>
                  )}
                  {restaurant.ratingTag === 'wishlist' && (
                    <span className="px-2 py-0.2 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center gap-0.5 shadow-2xs">
                      <Bookmark className="w-2.5 h-2.5" />
                      <span>{t.tagWishlist}</span>
                    </span>
                  )}
                  {restaurant.ratingTag === 'avoid_again' && (
                    <span className="px-2 py-0.2 rounded-full bg-slate-900 text-rose-300 font-black text-[10px] flex items-center gap-0.5 shadow-2xs">
                      <ThumbsDown className="w-2.5 h-2.5 text-rose-400" />
                      <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
                    </span>
                  )}

                  {/* Visibility Badge */}
                  {restaurant.visibility === 'private' ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold" title="僅自己可見">
                      🔒 私密
                    </span>
                  ) : restaurant.visibility === 'friends_only' ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold" title="僅吃貨好友可見">
                      👥 好友
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold" title="全公開（遊客與社群可見）">
                      🌐 公開
                    </span>
                  )}
                </div>

                {/* Subtitle: Category & Price & City */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                  <span className="font-bold text-slate-700">{restaurant.category}</span>
                  <span>·</span>
                  <span className="font-bold text-amber-700">{restaurant.priceRange}</span>
                  <span>·</span>
                  <span className="truncate flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{restaurant.city}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Share Trigger */}
            <button
              onClick={() => onShare(restaurant)}
              className="p-1.5 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors shrink-0 cursor-pointer"
              title="分享小卡"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* 🎯 Search Match Snippet if applicable */}
          {matchHighlight && (
            <div className={`p-2 rounded-xl border text-xs font-medium space-y-0.5 ${matchHighlight.badgeColor}`}>
              <span className="font-extrabold text-[10px] block opacity-80">{matchHighlight.label}</span>
              <p className="line-clamp-2 leading-tight">"{matchHighlight.snippet}"</p>
            </div>
          )}

          {/* Notes Snippet (Compact) */}
          {restaurant.personalNotes && !matchHighlight && (
            <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
              "{restaurant.personalNotes}"
            </p>
          )}

          {/* 🏷️ Key Dish Keywords (🌟 必吃 / ❌ 忌口) */}
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            {/* Must-eat chips */}
            {restaurant.mustEatDishes?.map((dish, i) => (
              <span
                key={i}
                className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-lg font-bold flex items-center gap-0.5"
              >
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                <span>{dish}</span>
              </span>
            ))}

            {/* Avoid chips */}
            {restaurant.avoidDishes?.map((dish, i) => (
              <span
                key={i}
                className="bg-rose-50 text-rose-900 border border-rose-200/80 px-2 py-0.5 rounded-lg font-bold line-through"
              >
                ❌ {dish}
              </span>
            ))}

            {/* Friend Recommendation Badge */}
            {recommender && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                {recommender.avatar} {recommender.name} 推薦
              </span>
            )}
          </div>

          {/* Video Mini Pills */}
          {restaurant.videos && restaurant.videos.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.videos.map((vid) => {
                const parsed = parseVideoUrl(vid.url);
                return (
                  <a
                    key={vid.id}
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 text-rose-500 fill-current" />
                    <span className="truncate max-w-[120px]">{vid.title || parsed.displayLabel}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Horizontal Footer Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
          <button
            onClick={() => onLocateOnMap(restaurant)}
            className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'zh-TW' ? '在地圖上查看' : 'マップで確認'}</span>
          </button>

          <button
            onClick={() => onIncrementVisit(restaurant.id)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            title="點擊造訪次數 +1"
          >
            <span>{restaurant.visitCount || 0} 次</span>
            <Plus className="w-3 h-3 text-slate-500" />
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
            onClick={() => onEdit(restaurant)}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title="編輯"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(restaurant.id)}
            className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors cursor-pointer"
            title="刪除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🖼️ 2. 有圖片時：維持視覺豐富的「大圖影音卡片 (Photo Card)」
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-white clean-card-shadow rounded-3xl overflow-hidden border border-slate-200/80 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
      <div>
        {/* Cover Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

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
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer"
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

          {/* 🎯 Deep Search Match Snippet */}
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold border border-slate-200 transition-all active:scale-95 cursor-pointer"
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
          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
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
          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
          title="Google Maps 導航"
        >
          <Navigation className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => onEdit(restaurant)}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          title="編輯"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(restaurant.id)}
          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors cursor-pointer"
          title="刪除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
