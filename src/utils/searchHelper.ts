import type { Restaurant } from '../types';

export interface SearchMatchHighlight {
  type: 'must_eat' | 'avoid' | 'notes' | 'video' | 'name' | 'category';
  label: string;
  snippet: string;
  badgeColor: string;
}

export function extractSearchMatch(restaurant: Restaurant, query: string): SearchMatchHighlight | null {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();

  // 1. Match in Must Eat Dishes
  const matchedMustEat = restaurant.mustEatDishes?.find((dish) => dish.toLowerCase().includes(q));
  if (matchedMustEat) {
    return {
      type: 'must_eat',
      label: '🌟 命中必點招牌',
      snippet: matchedMustEat,
      badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
    };
  }

  // 2. Match in Personal Notes / Flavor Reviews
  if (restaurant.personalNotes && restaurant.personalNotes.toLowerCase().includes(q)) {
    // Extract surrounding snippet
    const idx = restaurant.personalNotes.toLowerCase().indexOf(q);
    const start = Math.max(0, idx - 15);
    const end = Math.min(restaurant.personalNotes.length, idx + q.length + 30);
    const snippet = (start > 0 ? '...' : '') + restaurant.personalNotes.slice(start, end).trim() + (end < restaurant.personalNotes.length ? '...' : '');
    return {
      type: 'notes',
      label: '💬 真實口感評價',
      snippet,
      badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-200',
    };
  }

  // 3. Match in Avoid Dishes (Warning!)
  const matchedAvoid = restaurant.avoidDishes?.find((dish) => dish.toLowerCase().includes(q));
  if (matchedAvoid) {
    return {
      type: 'avoid',
      label: '❌ 避雷警戒餐點',
      snippet: matchedAvoid,
      badgeColor: 'bg-rose-100 text-rose-950 border-rose-300',
    };
  }

  // 4. Match in Short Videos
  const matchedVideo = restaurant.videos?.find(
    (v) => (v.title && v.title.toLowerCase().includes(q)) || (v.highlights && v.highlights.some((h) => h.toLowerCase().includes(q)))
  );
  if (matchedVideo) {
    return {
      type: 'video',
      label: '🎬 短影音介紹提及',
      snippet: matchedVideo.title || query,
      badgeColor: 'bg-purple-100 text-purple-950 border-purple-200',
    };
  }

  // 5. Match in Store Name or Category
  if (restaurant.name.toLowerCase().includes(q)) {
    return {
      type: 'name',
      label: '🏠 店名命中',
      snippet: restaurant.name,
      badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    };
  }

  return null;
}
