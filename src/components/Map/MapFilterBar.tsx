import React from 'react';
import type { RestaurantRatingTag, SortOption } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  Search, 
  Flame, 
  RotateCw, 
  ThumbsDown, 
  Bookmark, 
  X, 
  Sparkles 
} from 'lucide-react';

interface MapFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: RestaurantRatingTag | 'all';
  onTagSelect: (tag: RestaurantRatingTag | 'all') => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  selectedCity: string;
  onCitySelect: (city: string) => void;
  cities: string[];
  selectedFriendId: string;
  onFriendSelect: (id: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  lang: Language;
}

const QUICK_FOOD_SEARCHES = ['🧋 紅茶/奶茶', '🍮 焦糖布丁', '🍜 濃厚拉麵', '🥩 和牛/牛排', '☕ 手沖咖啡', '🍲 麻辣鍋', '🍰 甜點蛋糕', '🍣 壽司生魚片'];

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  selectedCity,
  onCitySelect,
  cities,
  sortOption,
  onSortChange,
  lang,
}) => {
  const t = translations[lang];

  const hasActiveFilters =
    searchQuery ||
    selectedTag !== 'all' ||
    selectedCity !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onTagSelect('all');
    onCitySelect('all');
    onSortChange('distance');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-3 sm:p-4 shadow-2xs space-y-2.5">
      {/* 🔍 Row 1: Search Bar + City Selector + Sort Selector */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        {/* Main Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'zh-TW' ? '搜尋特定餐點、飲料或口感（如：紅茶、焦糖布丁、沾麵、和牛）...' : 'メニュー・ドリンク・味の感想で検索（例：紅茶、プリン、和牛）...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium transition-all"
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

        {/* Controls: City & Multi-Mode Sorting */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => onCitySelect(e.target.value)}
            className="flex-1 sm:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{t.allCities}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* 🎯 Multi-Mode Sort Selector (距離優先 / 推薦星星優先 / 價錢優先) */}
          <div className="flex-1 sm:flex-none relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full text-xs pl-3 pr-8 py-2 bg-amber-50 border border-amber-200 text-amber-950 font-black rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
            >
              <option value="distance">📍 距離最近 (Nearest)</option>
              <option value="rating">👑 推薦度 & 星星優先 (Rating)</option>
              <option value="price_asc">💰 平價優先 ($ ➔ $$$$)</option>
              <option value="price_desc">💎 高級犒賞 ($$$$ ➔ $)</option>
              <option value="visits">🔄 最常造訪 (Most Visited)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🧋 Row 2: Popular Food & Drink Quick Search Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 mr-0.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{lang === 'zh-TW' ? '想找好吃的：' : '人気の検索：'}</span>
        </span>

        {QUICK_FOOD_SEARCHES.map((food) => {
          const cleanName = food.split(' ')[1] || food;
          const isSelected = searchQuery === cleanName;
          return (
            <button
              key={food}
              onClick={() => onSearchChange(isSelected ? '' : cleanName)}
              className={`px-2.5 py-1 rounded-xl font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-2xs scale-105'
                  : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/60'
              }`}
            >
              {food}
            </button>
          );
        })}
      </div>

      {/* 🏷️ Row 3: Rating Tag Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 scrollbar-none text-xs">
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
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
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
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <RotateCw className="w-3 h-3" />
          <span>{t.tagFrequentVisit}</span>
        </button>

        <button
          onClick={() => onTagSelect('wishlist')}
          className={`px-2.5 py-1 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 transition-all ${
            selectedTag === 'wishlist'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
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
            className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-bold underline shrink-0 ml-auto"
          >
            {lang === 'zh-TW' ? '清除篩選' : 'リセット'}
          </button>
        )}
      </div>
    </div>
  );
};
