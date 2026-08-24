import React from 'react';
import type { Restaurant, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { VideoEmbed } from './VideoEmbed';
import { 
  MapPin, 
  Calendar, 
  Plus, 
  Flame, 
  RotateCw, 
  ThumbsDown, 
  Bookmark, 
  HelpCircle, 
  Navigation, 
  Share2, 
  Edit3, 
  Trash2, 
  Star,
  Users,
  UtensilsCrossed,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RestaurantCardProps {
  restaurant: Restaurant;
  friends: Friend[];
  lang: Language;
  onIncrementVisit: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
  onShare: (restaurant: Restaurant) => void;
  onLocateOnMap?: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  friends,
  lang,
  onIncrementVisit,
  onEdit,
  onDelete,
  onShare,
  onLocateOnMap,
}) => {
  const t = translations[lang];

  const getTagBadge = (tag: Restaurant['ratingTag']) => {
    switch (tag) {
      case 'must_eat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm shadow-rose-200">
            <Flame className="w-3.5 h-3.5 fill-current" />
            {t.tagMustEat}
          </span>
        );
      case 'frequent_visit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm shadow-emerald-200">
            <RotateCw className="w-3.5 h-3.5" />
            {t.tagFrequentVisit}
          </span>
        );
      case 'avoid_again':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-rose-300 shadow-sm border border-rose-500/30">
            <ThumbsDown className="w-3.5 h-3.5" />
            {t.tagAvoidAgain}
          </span>
        );
      case 'wishlist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Bookmark className="w-3.5 h-3.5" />
            {t.tagWishlist}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            {t.tagMediocre}
          </span>
        );
    }
  };

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return t.neverVisited;
    const visitDate = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - visitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t.todayVisited;
    if (diffDays === 1) return t.yesterdayVisited;
    if (diffDays < 30) return `${diffDays} ${t.daysAgo} (${dateStr})`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} ${t.monthsAgo} (${dateStr})`;
    return `> 1 年前 (${dateStr})`;
  };

  const handlePlusOne = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 25,
      spread: 40,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
    });
    onIncrementVisit(restaurant.id);
  };

  const googleMapsSearchUrl = restaurant.googleMapsUrl || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`;

  const recommenderFriends = friends.filter(f => restaurant.recommendedByFriendIds?.includes(f.id));
  const companions = friends.filter(f => restaurant.dinedWithFriendIds?.includes(f.id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Header with image or category gradient */}
      <div className="relative h-36 bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <UtensilsCrossed className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {getTagBadge(restaurant.ratingTag)}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
            {restaurant.category}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/20">
            {restaurant.priceRange}
          </span>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <h3 className="font-bold text-lg leading-tight truncate drop-shadow">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-200 mt-0.5 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="truncate">{restaurant.city} · {restaurant.address}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Visit stats row */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          <div className="flex items-center gap-2">
            <div className="text-center px-2 py-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">{t.visitCount}</span>
              <span className="text-base font-black text-indigo-600 leading-none">
                {restaurant.visitCount}
                <span className="text-xs font-normal text-slate-400 ml-0.5">{t.timesUnit}</span>
              </span>
            </div>

            <div className="text-xs text-slate-600">
              <div className="flex items-center gap-1 font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.lastVisited}：{restaurant.lastVisitedDate || '—'}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {getRelativeTime(restaurant.lastVisitedDate)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlusOne}
            title={t.plusOneVisit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 font-semibold text-xs transition-all active:scale-95 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.plusOneVisit}</span>
          </button>
        </div>

        {/* Must-eat items */}
        {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{t.mustEatDishesTitle}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {restaurant.mustEatDishes.map((dish, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Avoid dishes (Honest Warning) */}
        {restaurant.avoidDishes && restaurant.avoidDishes.length > 0 && (
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.avoidDishesTitle}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {restaurant.avoidDishes.map((dish, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md border border-rose-200 line-through decoration-rose-500 decoration-1"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Short Videos list */}
        {restaurant.videos && restaurant.videos.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">
              {t.shortVideoSources} ({restaurant.videos.length})：
            </span>
            {restaurant.videos.map((vid) => (
              <VideoEmbed key={vid.id} video={vid} />
            ))}
          </div>
        )}

        {/* Personal Notes */}
        {restaurant.personalNotes && (
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <span className="font-semibold text-slate-700 block mb-0.5">{t.personalNotesTitle}</span>
            <p className="line-clamp-2 leading-relaxed">{restaurant.personalNotes}</p>
          </div>
        )}

        {/* Friends Info */}
        {(recommenderFriends.length > 0 || companions.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
            {recommenderFriends.length > 0 && (
              <div className="flex items-center gap-1 text-slate-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                <span className="font-medium text-purple-800">{t.recommenderLabel}</span>
                {recommenderFriends.map(f => (
                  <span key={f.id} className="inline-flex items-center gap-0.5 text-purple-900 font-semibold">
                    <span>{f.avatar}</span> {f.name}
                  </span>
                ))}
              </div>
            )}
            {companions.length > 0 && (
              <div className="flex items-center gap-1 text-slate-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <Users className="w-3 h-3 text-blue-500" />
                <span className="font-medium text-blue-800">{t.companionsLabel}</span>
                {companions.map(f => (
                  <span key={f.id} className="text-blue-900 font-semibold">
                    {f.avatar} {f.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1">
          {onLocateOnMap && (
            <button
              onClick={() => onLocateOnMap(restaurant)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title={t.locateOnMap}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
            title={t.googleMapsNav}
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.googleMapsNav}</span>
          </a>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onShare(restaurant)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title={t.shareText}
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => onEdit(restaurant)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title={t.editSpot}
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => onDelete(restaurant.id)}
            className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
            title={t.deleteSpot}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
