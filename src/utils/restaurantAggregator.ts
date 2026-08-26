import type { Restaurant, RestaurantContribution } from '../types';

/**
 * Normalizes a restaurant to a unique location/place key
 * Matches by cleaned Google Maps URL or (City + Normalized Name)
 */
export function normalizeRestaurantKey(r: Restaurant): string {
  if (r.googleMapsUrl && r.googleMapsUrl.trim()) {
    try {
      const url = new URL(r.googleMapsUrl.trim());
      const query = url.searchParams.get('query') || url.searchParams.get('q') || url.pathname;
      if (query && query.length > 5) {
        return 'gmap_' + query.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
      }
    } catch {}
  }

  const cleanCity = (r.city || '').trim().toLowerCase();
  const cleanName = (r.name || '')
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】|「.*?」|『.*?』/g, '')
    .replace(/[\s\-_—·.,]/g, '')
    .replace(/(總店|分店|旗艦店|門市|赤峰店|信義店|中山店|復興店|站前店|一號店|二號店)$/, '');

  return `${cleanCity}_${cleanName}`;
}

/**
 * Aggregates restaurants from multiple sources (Self, Friends, Global Community)
 * Combines identical restaurants into a single map point & list card with a multi-foodie reviews collection!
 */
export function aggregateRestaurants(
  restaurants: Restaurant[],
  currentFoodieId?: string,
  myRestaurantIds?: Set<string>
): Restaurant[] {
  if (!restaurants || restaurants.length === 0) return [];

  const cleanMyId = (currentFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
  const isGuest = !cleanMyId || cleanMyId === 'guest';

  const checkIsMine = (r: Restaurant): boolean => {
    if (myRestaurantIds && myRestaurantIds.has(r.id)) return true;
    if (isGuest) return false;
    const authorId = (r.authorFoodieId || '').toLowerCase().trim().replace(/[@#\s]/g, '');
    return Boolean(authorId && authorId === cleanMyId);
  };

  const groups = new Map<string, Restaurant[]>();

  for (const r of restaurants) {
    const key = normalizeRestaurantKey(r);
    const existing = groups.get(key) || [];
    existing.push(r);
    groups.set(key, existing);
  }

  const aggregatedList: Restaurant[] = [];

  for (const [, group] of groups.entries()) {
    if (group.length === 1) {
      const single = group[0];
      const isMine = checkIsMine(single);

      const contribution: RestaurantContribution = {
        restaurantId: single.id,
        authorFoodieId: single.authorFoodieId,
        authorName: isMine ? '我 (我的口袋筆記)' : (single.authorName || '熱心吃貨'),
        authorAvatar: single.authorAvatar || (isMine ? '👑' : '🥢'),
        isMine,
        ratingTag: single.ratingTag,
        visitCount: single.visitCount || 1,
        mustEatDishes: single.mustEatDishes || [],
        avoidDishes: single.avoidDishes || [],
        personalNotes: single.personalNotes || '',
        videos: single.videos || [],
        menuDishes: single.menuDishes || [],
        visibility: single.visibility || 'public',
        updatedAt: single.updatedAt,
      };

      aggregatedList.push({
        ...single,
        contributions: [contribution],
      });
      continue;
    }

    // Multiple foodies added the SAME restaurant!
    // 1. Pick Primary Restaurant (Prefer current user's version, else first in group)
    let primary = group.find((r) => checkIsMine(r));
    if (!primary) {
      primary = group[0];
    }

    // 2. Build contributions list
    const contributions: RestaurantContribution[] = [];
    const seenAuthors = new Set<string>();

    const primaryIsMine = checkIsMine(primary);
    const primaryAuthorKey = primaryIsMine ? 'mine' : (primary.authorFoodieId || primary.id);
    seenAuthors.add(primaryAuthorKey);

    contributions.push({
      restaurantId: primary.id,
      authorFoodieId: primary.authorFoodieId,
      authorName: primaryIsMine ? '我 (我的口袋筆記)' : (primary.authorName || '熱心吃貨'),
      authorAvatar: primary.authorAvatar || (primaryIsMine ? '👑' : '🥢'),
      isMine: primaryIsMine,
      ratingTag: primary.ratingTag,
      visitCount: primary.visitCount || 1,
      mustEatDishes: primary.mustEatDishes || [],
      avoidDishes: primary.avoidDishes || [],
      personalNotes: primary.personalNotes || '',
      videos: primary.videos || [],
      menuDishes: primary.menuDishes || [],
      visibility: primary.visibility || 'public',
      updatedAt: primary.updatedAt,
    });

    // Add other foodies' reviews
    for (const other of group) {
      if (other.id === primary.id) continue;
      const otherIsMine = checkIsMine(other);
      const authorKey = otherIsMine ? 'mine' : (other.authorFoodieId || other.id);
      if (seenAuthors.has(authorKey)) continue;
      seenAuthors.add(authorKey);

      contributions.push({
        restaurantId: other.id,
        authorFoodieId: other.authorFoodieId,
        authorName: otherIsMine ? '我 (我的口袋筆記)' : (other.authorName || '熱心吃貨'),
        authorAvatar: other.authorAvatar || (otherIsMine ? '👑' : '🥢'),
        isMine: otherIsMine,
        ratingTag: other.ratingTag,
        visitCount: other.visitCount || 1,
        mustEatDishes: other.mustEatDishes || [],
        avoidDishes: other.avoidDishes || [],
        personalNotes: other.personalNotes || '',
        videos: other.videos || [],
        menuDishes: other.menuDishes || [],
        visibility: other.visibility || 'public',
        updatedAt: other.updatedAt,
      });
    }

    // 3. Aggregate all unique videos
    const allVideos = [...(primary.videos || [])];
    const seenVideoUrls = new Set(allVideos.map((v) => v.url));

    for (const r of group) {
      if (r.id === primary.id) continue;
      (r.videos || []).forEach((v) => {
        if (!seenVideoUrls.has(v.url)) {
          seenVideoUrls.add(v.url);
          allVideos.push(v);
        }
      });
    }

    aggregatedList.push({
      ...primary,
      videos: allVideos,
      contributions,
    });
  }

  return aggregatedList;
}
