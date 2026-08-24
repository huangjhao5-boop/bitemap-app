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
  categories,
  selectedCity,
  onCitySelect,
  cities,
  selectedFriendId,
  onFriendSelect,
  friends,
  totalCount,
  filteredCount,
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
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
      {/* Top Search & City Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {/* City selector */}
          <select
            value={selectedCity}
            onChange={(e) => onCitySelect(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.allCities} ({cities.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Friend filter */}
          <select
            value={selectedFriendId}
            onChange={(e) => onFriendSelect(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t.allFriends}</option>
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.avatar} {f.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1.5 rounded-lg hover:bg-rose-50 flex items-center gap-1 shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Badges Carousel / Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onTagSelect('all')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all border ${
            selectedTag === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {t.allTag} ({filteredCount}/{totalCount})
        </button>

        <button
          onClick={() => onTagSelect('must_eat')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all border flex items-center gap-1 ${
            selectedTag === 'must_eat'
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs shadow-rose-200'
              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{t.tagMustEat}</span>
        </button>

        <button
          onClick={() => onTagSelect('frequent_visit')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all border flex items-center gap-1 ${
            selectedTag === 'frequent_visit'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-200'
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{t.tagFrequentVisit}</span>
        </button>

        <button
          onClick={() => onTagSelect('avoid_again')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all border flex items-center gap-1 ${
            selectedTag === 'avoid_again'
              ? 'bg-slate-900 text-rose-300 border-slate-900 shadow-xs ring-1 ring-rose-400'
              : 'bg-white text-rose-900 border-rose-300 hover:bg-rose-50'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>{t.tagAvoidAgain}</span>
        </button>

        <button
          onClick={() => onTagSelect('wishlist')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all border flex items-center gap-1 ${
            selectedTag === 'wishlist'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-200'
              : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{t.tagWishlist}</span>
        </button>

        {/* Category Pills */}
        <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategorySelect(selectedCategory === cat ? 'all' : cat)}
            className={`px-2.5 py-1 rounded-xl font-semibold shrink-0 transition-all border text-xs ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
