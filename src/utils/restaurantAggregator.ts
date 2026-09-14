import type { Restaurant, RestaurantContribution } from '../types';

/**
 * 智慧地點歸一化演算法 (Smart Location Key)
 * 結合「高精度 GPS 網格 (~150m)」與「清洗後的店名」，
 * 確保：同一家店能精準合併，但「同城市的不同分店」絕不會被誤吸進同一個圖釘！
 */
export function normalizeRestaurantKey(r: Restaurant): string {
  // 1. 若有有效經緯度，以 ~150 公尺為半徑建立地理網格 (小數點後 3 位約為 110 公尺)
  const lat = Number(r.lat);
  const lng = Number(r.lng);
  const hasValidCoords = isFinite(lat) && isFinite(lng) && (lat !== 0 || lng !== 0);

  const cleanName = (r.name || '')
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】|「.*?」|『.*?』/g, '')
    .replace(/[\s\-_—·.,]/g, '');

  if (hasValidCoords) {
    // 地理網格 + 核心店名：不同分店因經緯度不同，絕對不會誤判為同一間！
    const geoGrid = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    return `geo_${geoGrid}_${cleanName}`;
  }

  // 2. 若無經緯度，解析 Google Maps 搜尋參數
  if (r.googleMapsUrl && r.googleMapsUrl.trim()) {
    try {
      const url = new URL(r.googleMapsUrl.trim());
      const query = url.searchParams.get('query') || url.searchParams.get('q');
      if (query && query.length > 3) {
        return 'gmap_' + query.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
      }
    } catch {}
  }

  // 3. 最後兜底：城市 + 店名 + 地址前 6 碼 (避免無座標時連鎖店撞車)
  const cleanCity = (r.city || '').trim().toLowerCase();
  const cleanAddr = (r.address || '').trim().toLowerCase().replace(/[\s\-_—·.,]/g, '').slice(0, 8);
  return `${cleanCity}_${cleanName}_${cleanAddr}`;
}

/**
 * 餐廳聚合引擎 (Multi-Foodie Review Aggregator)
 * 將同一地點的好友、社群、個人評分融合，並將所有人推薦的必吃菜色智慧匯流！
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

    // 🌟 多位吃貨共同評比同一間餐廳！
    // 1. 決定主顯主體 (優先採納使用者自己的紀錄，其次採納造訪次數最高或資訊最完整者)
    let primary = group.find((r) => checkIsMine(r));
    if (!primary) {
      primary = [...group].sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))[0];
    }

    // 2. 構建所有吃貨的共筆評論庫
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

    // 3. 🚀 智慧匯流：融合全體好友的「必吃菜」與「避雷菜」，絕不遺漏任何吃貨情報！
    const allMustEat = Array.from(
      new Set(group.flatMap((r) => r.mustEatDishes || []).filter((d) => Boolean(d && d.trim())))
    );
    const allAvoid = Array.from(
      new Set(group.flatMap((r) => r.avoidDishes || []).filter((d) => Boolean(d && d.trim())))
    );

    // 4. 融合所有獨家短影音
    const allVideos = [...(primary.videos || [])];
    const seenVideoUrls = new Set(allVideos.map((v) => v.url));

    for (const r of group) {
      if (r.id === primary.id) continue;
      (r.videos || []).forEach((v) => {
        if (v && v.url && !seenVideoUrls.has(v.url)) {
          seenVideoUrls.add(v.url);
          allVideos.push(v);
        }
      });
    }

    aggregatedList.push({
      ...primary,
      mustEatDishes: allMustEat.length > 0 ? allMustEat : primary.mustEatDishes,
      avoidDishes: allAvoid.length > 0 ? allAvoid : primary.avoidDishes,
      videos: allVideos,
      contributions,
    });
  }

  return aggregatedList;
}
