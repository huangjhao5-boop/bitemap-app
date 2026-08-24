import React from 'react';
import type { RestaurantRatingTag, Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { Search, Flame, RotateCw, ThumbsDown, Bookmark, X } from 'lucide-react';

interface MapFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: RestaurantRatingTag | 'all';
  onTagSelect: (tag: RestaurantRatingTag | 'all') => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  categories: string[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
  cities: string[];
  selectedFriendId: string;
  onFriendSelect: (id: string) => void;
  friends: Friend[];
  totalCount: number;
  filteredCount: number;
  lang: Language;
}

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  selectedCategory,
  onCategorySelect,
  selectedCity,
  onCitySelect,
  cities,
  selectedFriendId,
  onFriendSelect,
  lang,
}) => {
  const t = translations[lang];

  const hasActiveFilters =
    searchQuery ||
    selectedTag !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCity !== 'all' ||
    selectedFriendId !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onTagSelect('all');
    onCategorySelect('all');
    onCitySelect('all');
    onFriendSelect('all');
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2.5 sm:p-3.5 shadow-xs space-y-2 sm:space-y-2.5">
      {/* Top Search & City Bar */}
      <div className="flex gap-2 items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* City selector */}
        <select
          value={selectedCity}
          onChange={(e) => onCitySelect(e.target.value)}
          className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shrink-0"
        >
          <option value="all">{t.allCities}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Quick Filter Tag Chips (Horizontally Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onTagSelect('all')}
          className={`px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 transition-all ${
            selectedTag === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {t.allTag}
        </button>

        <button
          onClick={() => onTagSelect('must_eat')}
          className={`px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 transition-all ${
            selectedTag === 'must_eat'
              ? 'bg-rose-500 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
          }`}
        >
          <Flame className="w-3 h-3 fill-current" />
          <span>{t.tagMustEat}</span>
        </button>

        <button
          onClick={() => onTagSelect('frequent_visit')}
          className={`px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 transition-all ${
            selectedTag === 'frequent_visit'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
          }`}
        >
          <RotateCw className="w-3 h-3" />
          <span>{t.tagFrequentVisit}</span>
        </button>

        <button
          onClick={() => onTagSelect('wishlist')}
          className={`px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 transition-all ${
            selectedTag === 'wishlist'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          <span>{t.tagWishlist}</span>
        </button>

        <button
          onClick={() => onTagSelect('avoid_again')}
          className={`px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 transition-all ${
            selectedTag === 'avoid_again'
              ? 'bg-slate-900 text-rose-300 shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ThumbsDown className="w-3 h-3 text-rose-500" />
          <span>{lang === 'zh-TW' ? '☠️ 黑名單' : '☠️ NG店'}</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-bold underline shrink-0"
          >
            {lang === 'zh-TW' ? '清除篩選' : 'リセット'}
          </button>
        )}
      </div>
    </div>
  );
};
