import type { VideoPlatform } from '../types';

export interface VideoInfo {
  platform: VideoPlatform;
  cleanUrl: string;
  embedUrl?: string;
  displayLabel: string;
  badgeColor: string;
  badgeBg: string;
}

export function parseVideoUrl(url: string): VideoInfo {
  const trimmed = url.trim();
  
  if (/instagram\.com\/(reel|p)\/([a-zA-Z0-9_-]+)/i.test(trimmed)) {
    const match = trimmed.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/i);
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

  if (/tiktok\.com\/(@[\w.-]+\/video\/\d+|v\/\d+|[\w.-]+)/i.test(trimmed) || /vt\.tiktok\.com\/\w+/i.test(trimmed)) {
    return {
      platform: 'tiktok',
      cleanUrl: trimmed,
      displayLabel: 'TikTok 短影音',
      badgeColor: 'text-neutral-900',
      badgeBg: 'bg-neutral-100 border-neutral-300 text-neutral-800',
    };
  }

  if (/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i.test(trimmed) || /youtu\.be\/([a-zA-Z0-9_-]+)/i.test(trimmed)) {
    const match = trimmed.match(/(?:shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
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

  if (/xiaohongshu\.com|xhslink\.com/i.test(trimmed)) {
    return {
      platform: 'xiaohongshu',
      cleanUrl: trimmed,
      displayLabel: '小紅書 筆記',
      badgeColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    };
  }

  return {
    platform: 'other',
    cleanUrl: trimmed,
    displayLabel: '網路影音/食記',
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

