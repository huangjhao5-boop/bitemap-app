import type { VideoPlatform } from '../types';
import { detectCity } from './geo';

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
      const res = await fetch(oembed, { signal: AbortSignal.timeout(4000) });
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
    if (/tiktok\.com/i.test(url)) {
      const oembed = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembed, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        const title: string = data.title || '';
        const author: string = data.author_name || '';
        if (title && !title.toLowerCase().includes('something went wrong')) {
          return {
            title,
            authorName: author,
            thumbnailUrl: data.thumbnail_url,
            rawText: [title, author].filter(Boolean).join(' '),
          };
        }
      }
    }

    // ── Instagram / 小紅書 / 其他：透過 allorigins proxy 抓 og:title ───
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(3500),
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

      // 排除登入頁與通用空標題
      const isFake = (t: string) => /instagram|login|登入|tiktok|見つかりません/i.test(t);
      const cleanTitle = isFake(ogTitle) ? '' : ogTitle;
      const cleanDesc = isFake(ogDesc) ? '' : ogDesc;

      const rawText = [cleanTitle, cleanDesc].filter(Boolean).join(' ');
      if (!rawText) return null;

      return { title: cleanTitle || undefined, rawText };
    }
  } catch (e) {
    // Timeout or network block: normal for anti-scraping platforms
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
  const raw = input.trim();
  const res: ExtractedRestaurantInfo = {
    mustEatDishes: [],
    avoidDishes: [],
  };

  // 1. Extract URL if present
  const urlMatch = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    res.videoUrl = urlMatch[0];
  }

  // 2. Clean text without URLs for better shop name & detail matching
  const cleanText = raw.replace(/https?:\/\/[^\s"'<>]+/gi, ' ').trim();

  // 3. Extract City using the smart city detector
  const detectedCity = detectCity(cleanText);
  if (detectedCity && detectedCity !== '台北市') {
    res.city = detectedCity;
  } else if (cleanText.includes('台北') || cleanText.includes('臺北')) {
    res.city = '台北市';
  }

  // 4. Extract Name
  // Priority A: Explicit tag like 店名：xxx, 餐廳：xxx, 這家叫：xxx
  const explicitMatch = cleanText.match(/(?:店名|餐廳名稱|餐廳|店家|這家叫|吃這家|推薦)[：:\s]*([^\n,，。#\s]+)/);
  if (explicitMatch && explicitMatch[1].length <= 25 && !explicitMatch[1].startsWith('http')) {
    res.name = explicitMatch[1].trim();
  }

  // Priority B: Name in brackets like 【...】 or 「...」 or 《...》 or 『...』
  if (!res.name) {
    const bracketMatch = cleanText.match(/[【「《『]([^】」》』]+)[】」》』]/);
    if (bracketMatch && bracketMatch[1].length <= 25 && !bracketMatch[1].startsWith('http')) {
      res.name = bracketMatch[1].trim();
    }
  }

  // Priority C: Hashtags (e.g. #隱家拉麵 #赤峰店)
  if (!res.name) {
    const hashtags = Array.from(cleanText.matchAll(/#([^\s#]+)/g)).map((m) => m[1]);
    for (const tag of hashtags) {
      const lower = tag.toLowerCase();
      if (
        !['美食', '探店', '推薦', '必吃', '吃貨', '日常', 'shorts', 'reels', 'tiktok', 'fyp', 'food', 'foodie', '台北美食', '台中美食', '高雄美食', '日本美食'].includes(lower) &&
        tag.length >= 2 &&
        tag.length <= 22
      ) {
        res.name = tag.trim();
        break;
      }
    }
  }

  // Priority D: Category heuristics
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
    { key: '珍珠', label: '甜點午茶' },
    { key: 'タピオカ', label: '甜點午茶' },
  ];
  for (const cat of categories) {
    if (cleanText.includes(cat.key)) {
      res.category = cat.label;
      break;
    }
  }

  // Priority E: Fallback search for lines with keywords
  if (!res.name) {
    const lines = cleanText.split(/[\n,，。]/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (
        (line.includes('店') || line.includes('屋') || line.includes('館') || line.includes('拉麵') || line.includes('燒肉') || line.includes('食堂') || line.includes('居酒屋') || line.includes('茶')) &&
        line.length <= 25
      ) {
        res.name = line.replace(/^[#@探店美食推薦必吃\s]+/, '').trim();
        break;
      }
    }
  }

  // 5. Extract Must-Eat Dishes
  const mustEatPatterns = /(?:必點|必吃|推薦|招牌|名物)[：:\s]*([^\n。，]+)/g;
  let m;
  while ((m = mustEatPatterns.exec(cleanText)) !== null) {
    const items = m[1].split(/[,，、\s]+/).filter((x) => x.trim().length > 1 && x.trim().length < 25);
    items.forEach((it) => {
      if (!res.mustEatDishes.includes(it.trim())) {
        res.mustEatDishes.push(it.trim());
      }
    });
  }

  // 提取如『茹で卵中華そば』950円、『めし』100円等括號品項
  const bracketDishes = Array.from(cleanText.matchAll(/[『「【]([^』」】]+)[』」】]\s*([0-9,]+円|\$[0-9]+)?/g));
  for (const bd of bracketDishes) {
    const dName = bd[1].trim();
    if (dName !== res.name && dName.length >= 2 && dName.length <= 20) {
      const price = bd[2] ? ` (${bd[2]})` : '';
      const fullDish = dName + price;
      if (!res.mustEatDishes.includes(fullDish) && !fullDish.includes('ラーメン') && !fullDish.includes('オープン')) {
        res.mustEatDishes.push(fullDish);
      }
    }
  }

  // 6. Extract Avoid Dishes / Blacklist
  const avoidPatterns = /(?:避雷|勿點|不推|踩雷|雷|超鹹|難吃)[：:\s]*([^\n。，]+)/g;
  let am;
  while ((am = avoidPatterns.exec(cleanText)) !== null) {
    const items = am[1].split(/[,，、\s]+/).filter((x) => x.trim().length > 1 && x.trim().length < 25);
    items.forEach((it) => {
      if (!res.avoidDishes.includes(it.trim())) {
        res.avoidDishes.push(it.trim());
      }
    });
  }

  // 7. Extract Address
  const addrMatch = cleanText.match(/(?:地址|位置|在|位於|場所)[：:\s]*([^\n。]+)/);
  if (addrMatch && (addrMatch[1].includes('路') || addrMatch[1].includes('街') || addrMatch[1].includes('區') || addrMatch[1].includes('號') || addrMatch[1].includes('市') || addrMatch[1].includes('町'))) {
    res.address = addrMatch[1].trim();
  }

  // 日語地址提取（如：鈴鹿市三日市）
  if (!res.address) {
    const jpDistMatch = cleanText.match(/(?:今回|今日|昨日|ここ|場所)?(?:は|の|に|で|へ)?([一-龠ぁ-んァ-ヶ]{2,5}(?:市|区|町|村)[一-龠ぁ-んァ-ヶ0-9丁目]*?)(?=[にでのへを、，\s]|[0-9]+[\/月]|$)/);
    if (jpDistMatch && jpDistMatch[1].length >= 2 && jpDistMatch[1].length <= 20 && !jpDistMatch[1].startsWith('http')) {
      const dist = jpDistMatch[1].trim();
      res.address = (res.city && !dist.includes(res.city) ? `${res.city} ` : '') + dist;
    }
  }

  // 8. Personal notes fallback
  if (cleanText.length > 25) {
    res.personalNotes = cleanText.slice(0, 200);
  }

  return res;
}

