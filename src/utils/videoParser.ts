import type { VideoPlatform } from '../types';

export interface VideoInfo {
  platform: VideoPlatform;
  cleanUrl: string;
  embedUrl?: string;
  displayLabel: string;
  badgeColor: string;
  badgeBg: string;
}

// ─── 影片 Metadata（從 oEmbed API 或 proxy 解析出的資料）───────────────────────
export interface VideoMetadata {
  title?: string;       // 影片標題 / caption
  authorName?: string;  // 創作者名稱
  thumbnailUrl?: string;
  rawText: string;      // 所有可解析的原始文字（供 extractRestaurantInfoFromText 使用）
}

/**
 * 嘗試從影片 URL 取得標題/說明文字
 * 利用各平台的 oEmbed API（免費、無需 Key），失敗時嘗試 proxy 抓 og:title
 */
export async function fetchVideoMetadata(videoUrl: string): Promise<VideoMetadata | null> {
  const url = videoUrl.trim();

  try {
    // ── YouTube oEmbed ─────────────────────────────────────────────────────────
    if (/youtube\.com|youtu\.be/i.test(url)) {
      const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembed, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const title: string = data.title || '';
        const author: string = data.author_name || '';
        return {
          title,
          authorName: author,
          thumbnailUrl: data.thumbnail_url,
          rawText: [title, author].filter(Boolean).join(' '),
        };
      }
    }

    // ── TikTok oEmbed ──────────────────────────────────────────────────────────
    if (/tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(url)) {
      const oembed = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembed, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const title: string = data.title || '';
        const author: string = data.author_name || '';
        return {
          title,
          authorName: author,
          thumbnailUrl: data.thumbnail_url,
          rawText: [title, author].filter(Boolean).join(' '),
        };
      }
    }

    // ── Instagram / 小紅書 / 其他：透過 allorigins proxy 抓 og:title + og:description ───
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const html: string = (json?.contents as string) || '';
      if (!html) return null;

      const ogTitle = (
        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
      )?.[1]?.trim() || '';

      const ogDesc = (
        html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
      )?.[1]?.trim() || '';

      const rawText = [ogTitle, ogDesc].filter(Boolean).join(' ');
      if (!rawText) return null;

      return { title: ogTitle || undefined, rawText };
    }
  } catch (e) {
    console.warn('[fetchVideoMetadata] failed:', e);
  }

  return null;
}

export function parseVideoUrl(input: string): VideoInfo {
  let trimmed = input.trim();
  
  // Extract pure URL if mixed with share text or comments
  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    trimmed = urlMatch[0];
  }

  // Instagram Reels or Posts
  if (/instagram\.com\/(?:reel|reels|p)\/([a-zA-Z0-9_-]+)/i.test(trimmed)) {
    const match = trimmed.match(/instagram\.com\/(?:reel|reels|p)\/([a-zA-Z0-9_-]+)/i);
    const shortcode = match ? match[1] : '';
    return {
      platform: 'instagram',
      cleanUrl: trimmed,
      embedUrl: shortcode ? `https://www.instagram.com/reel/${shortcode}/embed` : undefined,
      displayLabel: 'Instagram Reel',
      badgeColor: 'text-pink-600',
      badgeBg: 'bg-gradient-to-r from-purple-100 to-pink-100 border-pink-200 text-pink-700',
    };
  }

  // TikTok
  if (/tiktok\.com\/(@[\w.-]+\/video\/\d+|v\/\d+|[\w.-]+)/i.test(trimmed) || /vt\.tiktok\.com\/\w+/i.test(trimmed) || /vm\.tiktok\.com\/\w+/i.test(trimmed)) {
    return {
      platform: 'tiktok',
      cleanUrl: trimmed,
      displayLabel: 'TikTok 短影音',
      badgeColor: 'text-neutral-900',
      badgeBg: 'bg-neutral-100 border-neutral-300 text-neutral-800',
    };
  }

  // YouTube Shorts or Videos
  if (/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/i.test(trimmed)) {
    const match = trimmed.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
    const videoId = match ? match[1] : '';
    return {
      platform: 'youtube',
      cleanUrl: trimmed,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : undefined,
      displayLabel: 'YouTube Shorts',
      badgeColor: 'text-red-600',
      badgeBg: 'bg-red-50 border-red-200 text-red-700',
    };
  }

  // Xiaohongshu (RED)
  if (/xiaohongshu\.com|xhslink\.com/i.test(trimmed)) {
    return {
      platform: 'xiaohongshu',
      cleanUrl: trimmed,
      displayLabel: '小紅書 探店',
      badgeColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    };
  }

  // Douyin
  if (/douyin\.com|v\.douyin\.com/i.test(trimmed)) {
    return {
      platform: 'tiktok',
      cleanUrl: trimmed,
      displayLabel: '抖音 探店短影音',
      badgeColor: 'text-neutral-900',
      badgeBg: 'bg-neutral-100 border-neutral-300 text-neutral-800',
    };
  }

  return {
    platform: 'other',
    cleanUrl: trimmed,
    displayLabel: '外部探店影音 / 食記',
    badgeColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
  };
}

export interface ExtractedRestaurantInfo {
  name?: string;
  category?: string;
  city?: string;
  address?: string;
  mustEatDishes: string[];
  avoidDishes: string[];
  videoUrl?: string;
  videoTitle?: string;
  personalNotes?: string;
}

export function extractRestaurantInfoFromText(input: string): ExtractedRestaurantInfo {
  const text = input.trim();
  const res: ExtractedRestaurantInfo = {
    mustEatDishes: [],
    avoidDishes: [],
  };

  // 1. Extract URL if present
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    res.videoUrl = urlMatch[0];
  }

  // 2. Extract City
  const cities = ['台北市', '新北市', '台中市', '台南市', '高雄市', '新竹市', '桃園市', '東京', '大阪', '京都', '福岡'];
  for (const city of cities) {
    if (text.includes(city) || text.includes(city.replace('市', ''))) {
      res.city = city;
      break;
    }
  }

  // 3. Extract Name from brackets like 【...】 or 「...」 or 《...》
  const bracketMatch = text.match(/[【「《『]([^】」》』]+)[】」》』]/);
  if (bracketMatch && bracketMatch[1].length <= 25) {
    res.name = bracketMatch[1].trim();
  }

  // 4. Extract Category heuristics
  const categories = [
    { key: '拉麵', label: '日式拉麵' },
    { key: '燒肉', label: '燒肉居酒屋' },
    { key: '火鍋', label: '火鍋鍋物' },
    { key: '甜點', label: '法式甜點' },
    { key: '咖啡', label: '咖啡早午餐' },
    { key: '漢堡', label: '美式漢堡' },
    { key: '壽司', label: '日式料理' },
    { key: '居酒屋', label: '居酒屋串燒' },
    { key: '泰式', label: '泰式料理' },
    { key: '義大利麵', label: '義式料理' },
    { key: '小吃', label: '在地小吃' },
  ];
  for (const cat of categories) {
    if (text.includes(cat.key)) {
      res.category = cat.label;
      break;
    }
  }

  // If no name extracted from bracket, search for keywords
  if (!res.name) {
    const lines = text.split(/[\n,，。]/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (
        (line.includes('店') || line.includes('屋') || line.includes('館') || line.includes('拉麵') || line.includes('燒肉')) &&
        !line.startsWith('http') &&
        line.length <= 20
      ) {
        res.name = line.replace(/^[#@探店美食推薦\s]+/, '').trim();
        break;
      }
    }
  }

  // 5. Extract Must-Eat Dishes
  const mustEatPatterns = /(?:必點|必吃|推薦|招牌|名物)[：:\s]*([^\n。，]+)/g;
  let m;
  while ((m = mustEatPatterns.exec(text)) !== null) {
    const items = m[1].split(/[,，、\s]+/).filter((x) => x.trim().length > 1 && x.trim().length < 25);
    items.forEach((it) => {
      if (!res.mustEatDishes.includes(it.trim())) {
        res.mustEatDishes.push(it.trim());
      }
    });
  }

  // 6. Extract Avoid Dishes / Blacklist
  const avoidPatterns = /(?:避雷|勿點|不推|踩雷|雷|超鹹|難吃)[：:\s]*([^\n。，]+)/g;
  let am;
  while ((am = avoidPatterns.exec(text)) !== null) {
    const items = am[1].split(/[,，、\s]+/).filter((x) => x.trim().length > 1 && x.trim().length < 25);
    items.forEach((it) => {
      if (!res.avoidDishes.includes(it.trim())) {
        res.avoidDishes.push(it.trim());
      }
    });
  }

  // 7. Extract Address
  const addrMatch = text.match(/(?:地址|位置|在)[：:\s]*([^\n。]+)/);
  if (addrMatch && (addrMatch[1].includes('路') || addrMatch[1].includes('街') || addrMatch[1].includes('區') || addrMatch[1].includes('號'))) {
    res.address = addrMatch[1].trim();
  }

  // 8. Personal notes fallback
  if (text.length > 30) {
    res.personalNotes = text.slice(0, 200);
  }

  return res;
}

