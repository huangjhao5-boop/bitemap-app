import { detectCity, CITY_COORDS } from './geo';
export { detectCity };

export interface PlaceSearchResult {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  googleSearchUrl: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rawType?: string;
  source?: 'photon' | 'nominatim' | 'google_share' | 'custom';
}

// 🍜 Guess category from name and amenity
export function guessCategory(name: string, amenity: string = ''): string {
  const text = (name + ' ' + amenity).toLowerCase();
  if (text.includes('拉麵') || text.includes('ラーメン') || text.includes('らーめん') || text.includes('つけ麺') || text.includes('中華そば') || text.includes('麵') || text.includes('ramen') || text.includes('udon') || text.includes('蕎麥') || text.includes('うどん') || text.includes('そば')) return '日式拉麵';
  if (text.includes('炒飯') || text.includes('chahan') || text.includes('チャーハン') || text.includes('中華') || text.includes('餃子')) return '中華料理 / 炒飯專門';
  if (text.includes('燒肉') || text.includes('焼肉') || text.includes('ホルモン') || text.includes('牛排') || text.includes('肉') || text.includes('bbq') || text.includes('steak') || text.includes('串燒') || text.includes('燒烤') || text.includes('焼き鳥')) return '和牛燒肉';
  if (text.includes('火鍋') || text.includes('鍋') || text.includes('麻辣') || text.includes('hotpot') || text.includes('しゃぶ') || text.includes('すき焼き')) return '火鍋鍋物';
  if (text.includes('日料') || text.includes('壽司') || text.includes('すし') || text.includes('sushi') || text.includes('生魚片') || text.includes('居酒屋') || text.includes('海鮮') || text.includes('丼飯') || text.includes('天ぷら') || text.includes('とんかつ') || text.includes('定食') || text.includes('屋台')) return '日式料理';
  if (text.includes('咖啡') || text.includes('早午餐') || text.includes('cafe') || text.includes('coffee') || text.includes('brunch') || text.includes('tea') || text.includes('喫茶')) return '咖啡早午餐';
  if (text.includes('甜點') || text.includes('蛋糕') || text.includes('冰') || text.includes('dessert') || text.includes('bakery') || text.includes('麵包') || text.includes('豆花') || text.includes('刨冰') || text.includes('舒芙蕾') || text.includes('スイーツ') || text.includes('パフェ')) return '甜點午茶';
  if (text.includes('披薩') || text.includes('義式') || text.includes('pizza') || text.includes('義大利麵') || text.includes('pasta') || text.includes('パスタ')) return '義式料理';
  if (text.includes('漢堡') || text.includes('美式') || text.includes('burger') || text.includes('バーガー') || text.includes('薯條')) return '美式漢堡';
  if (text.includes('酒吧') || text.includes('酒') || text.includes('bar') || text.includes('bistro') || text.includes('餐酒館') || text.includes('pub')) return '微醺酒吧';
  if (text.includes('牛肉麵') || text.includes('小吃') || text.includes('便當') || text.includes('滷肉飯') || text.includes('夜市') || text.includes('水餃') || text.includes('熱炒') || text.includes('雞肉飯') || text.includes('肉圓')) return '台灣道地小吃';
  if (text.includes('泰式') || text.includes('越式') || text.includes('韓式') || text.includes('港式') || text.includes('飲茶') || text.includes('咖哩') || text.includes('curry') || text.includes('カレー')) return '異國美食';
  return '精選美食';
}

// 🌟 Verified Famous / Popular POI Database
export const CURATED_VERIFIED_SPOTS: Array<{
  keywords: string[];
  name: string;
  category: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  googleMapsUrl?: string;
}> = [
  {
    keywords: [
      '炒飯 信',
      '愛知 炒飯 信',
      '愛知 炒飯',
      '信 炒飯',
      'shin',
      '炒飯専門店 信',
      'チャーハン 信',
      'チャーハン専門店 信',
      '大須 炒飯',
      'lmydevfcgwr5z4aon',
    ],
    name: '炒飯 信 (Shin)',
    category: '中華料理 / 炒飯專門',
    city: '愛知縣 (名古屋)',
    address: '愛知県名古屋市中区大須3-4-15 (大須商店街)',
    lat: 35.1610,
    lng: 136.9048,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=%E6%84%9B%E7%9F%A5%E7%9C%8C%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B8%82%E4%B8%AD%E5%8C%BA%E5%A4%A7%E9%A0%883-4-15+%E7%82%92%E9%A3%AF+%E4%BF%A1',
  },
  {
    keywords: ['今大魯肉飯', '新北 三重 今大魯肉飯', '三重 今大', '今大 魯肉飯', '今大'],
    name: '今大魯肉飯',
    category: '台灣道地小吃',
    city: '新北市 - 三重區',
    address: '新北市三重區大仁街40號',
    lat: 25.0645,
    lng: 121.4922,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=%E6%96%B0%E5%8C%97%E5%B8%82%E4%B8%89%E9%87%8D%E5%8D%80%E5%A4%A7%E4%BB%81%E8%A1%9740%E8%99%9F+%E4%BB%8A%E5%A4%A7%E9%AD%AF%E8%82%89%E9%A3%AF',
  },
  {
    keywords: ['店小二魯肉飯', '三重 店小二', '店小二'],
    name: '店小二魯肉飯',
    category: '台灣道地小吃',
    city: '新北市 - 三重區',
    address: '新北市三重區大同北路27號',
    lat: 25.0648,
    lng: 121.4965,
    priceRange: '$',
  },
  {
    keywords: ['唯豐魯肉飯', '三重 唯豐', '唯豐'],
    name: '唯豐魯肉飯',
    category: '台灣道地小吃',
    city: '新北市 - 三重區',
    address: '新北市三重區三民街131號',
    lat: 25.0658,
    lng: 121.4880,
    priceRange: '$',
  },
  {
    keywords: ['五燈獎豬腳魯肉飯', '三重 五燈獎', '五燈獎'],
    name: '五燈獎豬腳魯肉飯',
    category: '台灣道地小吃',
    city: '新北市 - 三重區',
    address: '新北市三重區自強路一段119號',
    lat: 25.0664,
    lng: 121.4998,
    priceRange: '$',
  },
  {
    keywords: ['日本 三重 松阪牛', '三重 松阪牛', '松阪牛 一升びん', '一升びん', '一升瓶'],
    name: '一升びん 本店 (松阪牛A5燒肉)',
    category: '和牛燒肉',
    city: '三重縣',
    address: '三重県松阪市南町232-3',
    lat: 34.5712,
    lng: 136.5365,
    priceRange: '$$$$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=%E4%B8%89%E9%87%8D%E7%9C%8C%E6%9D%BE%E9%98%AA%E5%B8%82%E5%8D%97%E7%94%BA232-3+%E4%B8%80%E5%8D%87%E3%81%B3%E3%82%93',
  },
  {
    keywords: ['台北 隱家拉麵', '隱家拉麵', '隱家拉麵 赤峰店'],
    name: '隱家拉麵 赤峰店',
    category: '日式拉麵',
    city: '台北市 - 大同區',
    address: '台北市大同區南京西路25巷28號',
    lat: 25.0538,
    lng: 121.5204,
    priceRange: '$$',
  },
  {
    keywords: ['詹記麻辣火鍋', '詹記 敦南店', '詹記'],
    name: '詹記麻辣火鍋 敦南店',
    category: '火鍋鍋物',
    city: '台北市 - 大安區',
    address: '台北市大安區和平東路三段60號',
    lat: 25.0250,
    lng: 121.5492,
    priceRange: '$$$',
  },
  {
    keywords: ['鼎泰豐 信義店', '鼎泰豐 信義本店', '鼎泰豐'],
    name: '鼎泰豐 信義本店',
    category: '台灣道地小吃',
    city: '台北市 - 大安區',
    address: '台北市大安區信義路二段194號',
    lat: 25.0336,
    lng: 121.5303,
    priceRange: '$$$',
  },
  {
    keywords: ['東京 一蘭拉麵', '一蘭 新宿', '一蘭拉麵'],
    name: '一蘭 新宿中央東口店',
    category: '日式拉麵',
    city: '東京都',
    address: '東京都新宿区新宿3-34-11',
    lat: 35.6908,
    lng: 139.7032,
    priceRange: '$$',
  },
  {
    keywords: ['福岡 炭火燒鳥', '權兵衛', '炭火燒鳥 權兵衛'],
    name: '炭火焼鳥 権兵衛 本店',
    category: '日式料理',
    city: '福岡縣 (博多)',
    address: '福岡県福岡市博多区博多駅前3-18-1',
    lat: 33.5878,
    lng: 130.4178,
    priceRange: '$$',
  },
  {
    keywords: ['台南 牛肉湯', '文章牛肉湯'],
    name: '文章牛肉湯 安平總店',
    category: '台灣道地小吃',
    city: '台南市',
    address: '台南市安平區安平路300號',
    lat: 23.0003,
    lng: 120.1698,
    priceRange: '$',
  },
  {
    keywords: ['台中 和牛燒肉', '屋馬燒肉', '屋馬'],
    name: '屋馬燒肉 國安店',
    category: '和牛燒肉',
    city: '台中市 - 西屯區',
    address: '台中市西屯區國安一路168號B1',
    lat: 24.1925,
    lng: 120.6033,
    priceRange: '$$$$',
  },

  // ─── WILLcha 未来茶 タピオカ 連鎖分店 ───────────────────────────────────────
  {
    keywords: [
      'WILLcha', 'willcha', '未来茶', '未來茶', 'ウィルチャ',
      'タピオカ 道頓堀', '道頓堀 タピオカ', '道頓堀 珍珠奶茶',
      'WILLcha 道頓堀', '未来茶 道頓堀', '未来茶 大阪',
    ],
    name: 'WILLcha 未来茶 タピオカ 道頓堀店',
    category: '甜點午茶',
    city: '大阪府 (道頓堀)',
    address: '大阪府大阪市中央区道頓堀1丁目 (道頓堀商店街)',
    lat: 34.6688,
    lng: 135.5013,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E9%81%93%E9%A0%93%E5%A0%80%E5%BA%97+%E5%A4%A7%E9%98%AA',
  },
  {
    keywords: [
      'WILLcha 心齋橋', '未来茶 心齋橋', 'willcha 心斎橋', '未来茶 心斎橋',
      'WILLcha 大阪 心斎橋',
    ],
    name: 'WILLcha 未来茶 タピオカ 心斎橋店',
    category: '甜點午茶',
    city: '大阪府 (心齋橋)',
    address: '大阪府大阪市中央区心斎橋筋2丁目',
    lat: 34.6726,
    lng: 135.5014,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E5%BF%83%E6%96%8E%E6%A9%8B%E5%BA%97+%E5%A4%A7%E9%98%AA',
  },
  {
    keywords: [
      'WILLcha 新宿', '未来茶 新宿', 'willcha 東京', '未来茶 東京',
    ],
    name: 'WILLcha 未来茶 タピオカ 新宿店',
    category: '甜點午茶',
    city: '東京都 (新宿)',
    address: '東京都新宿区新宿3丁目',
    lat: 35.6905,
    lng: 139.7006,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E6%96%B0%E5%AE%BF%E5%BA%97',
  },
  {
    keywords: [
      'WILLcha 渋谷', '未来茶 渋谷', 'willcha 渋谷', '未来茶 渋谷店',
    ],
    name: 'WILLcha 未来茶 タピオカ 渋谷店',
    category: '甜點午茶',
    city: '東京都 (渋谷)',
    address: '東京都渋谷区渋谷2丁目',
    lat: 35.6598,
    lng: 139.7016,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E6%B8%8B%E8%B0%B7%E5%BA%97',
  },
  {
    keywords: [
      'WILLcha 池袋', '未来茶 池袋', 'willcha 池袋',
    ],
    name: 'WILLcha 未来茶 タピオカ 池袋店',
    category: '甜點午茶',
    city: '東京都 (池袋)',
    address: '東京都豊島区東池袋1丁目',
    lat: 35.7282,
    lng: 139.7116,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E6%B1%A0%E8%A2%8B%E5%BA%97',
  },
  {
    keywords: [
      'WILLcha 京都', '未来茶 京都', 'willcha 京都', '未来茶 京都四条',
    ],
    name: 'WILLcha 未来茶 タピオカ 京都四条店',
    category: '甜點午茶',
    city: '京都府 (四条)',
    address: '京都府京都市下京区四条通',
    lat: 35.0038,
    lng: 135.7601,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E4%BA%AC%E9%83%BD%E5%9B%9B%E6%9D%A1%E5%BA%97',
  },
  {
    keywords: [
      'WILLcha 名古屋', '未来茶 名古屋', 'willcha 名古屋', '未来茶 栄店',
    ],
    name: 'WILLcha 未来茶 タピオカ 名古屋栄店',
    category: '甜點午茶',
    city: '愛知縣 (名古屋)',
    address: '愛知県名古屋市中区栄3丁目',
    lat: 35.1688,
    lng: 136.9077,
    priceRange: '$',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=WILLcha+%E6%9C%AA%E6%9D%A5%E8%8C%B6+%E5%90%8D%E5%8F%A4%E5%B1%8B%E6%A0%84%E5%BA%97',
  },
];

// 🌐 Smart Universal Google Maps / Search Link Live Resolver (Zero Key Needed)
export async function resolveGooglePlaceUrl(urlStr: string): Promise<PlaceSearchResult | null> {
  const str = urlStr.trim();
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    return null;
  }

  // 1. Direct check against curated spot database
  const lowerUrl = str.toLowerCase();
  for (const spot of CURATED_VERIFIED_SPOTS) {
    if (spot.keywords.some((kw) => lowerUrl.includes(kw.toLowerCase()))) {
      return {
        id: `curated_${Date.now()}`,
        name: spot.name,
        category: spot.category,
        city: spot.city,
        address: spot.address,
        lat: spot.lat,
        lng: spot.lng,
        googleMapsUrl: spot.googleMapsUrl || str,
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${spot.name} ${spot.city} 美食 評價`)}`,
        priceRange: spot.priceRange,
        source: 'google_share',
      };
    }
  }

  let placeName = '';
  let lat = 25.0478;
  let lng = 121.5319;
  let detectedCity = '台北市';
  let formattedAddress = '';

  // Case 1: Google Maps Place URL (/maps/place/Name/@lat,lng)
  const placeMatch = str.match(/\/maps\/place\/([^/@?#]+)(?:\/@([0-9.-]+),([0-9.-]+))?/i);
  if (placeMatch) {
    try {
      placeName = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ');
    } catch {
      placeName = placeMatch[1].replace(/\+/g, ' ');
    }
    if (placeMatch[2] && placeMatch[3]) {
      lat = parseFloat(placeMatch[2]);
      lng = parseFloat(placeMatch[3]);
    }
  }

  // Case 2: Google Search query link (?q=Name or ?query=Name)
  if (!placeName) {
    const qMatch = str.match(/[?&](?:q|query)=([^&#]+)/i);
    if (qMatch) {
      try {
        placeName = decodeURIComponent(qMatch[1]).replace(/\+/g, ' ');
      } catch {
        placeName = qMatch[1].replace(/\+/g, ' ');
      }
    }
  }

  // Case 3: Live Dynamic HTML Resolver for Short URLs (share.google, maps.app.goo.gl, goo.gl/maps)
  const isShortLink = /share\.google|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(str);
  if (isShortLink || !placeName) {
    // 使用 allorigins.win/get (JSON 包裝版，UTF-8 安全) 避免亂碼
    // /raw 直接傳原始 bytes，瀏覽器可能用錯誤 encoding 解讀
    // /get 回傳 JSON { contents: '...' }，contents 已是 UTF-8 字串
    const proxies: Array<{ url: string; isJson: boolean }> = [
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(str)}`,
        isJson: true,
      },
      {
        url: `https://corsproxy.io/?url=${encodeURIComponent(str)}`,
        isJson: false,
      },
    ];

    for (const proxy of proxies) {
      if (placeName && placeName !== 'Google 分享店家') break;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(proxy.url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json, text/html, */*' },
        });
        clearTimeout(timer);

        if (!res.ok) continue;

        let html = '';
        if (proxy.isJson) {
          try {
            const json = await res.json();
            // allorigins /get 回傳 { contents: string, status: {...} }
            html = (json?.contents as string) || '';
          } catch {
            html = await res.text();
          }
        } else {
          // corsproxy.io 直接 stream raw bytes，強制以 UTF-8 解讀
          const buf = await res.arrayBuffer();
          html = new TextDecoder('utf-8', { fatal: false }).decode(buf);
        }

        if (!html) continue;

        // 1. 偵測頁面宣告的 charset，若不是 UTF-8 則重新 decode
        const charsetMatch = html.match(/charset=["']?([^"'\s;>]+)/i);
        const declaredCharset = charsetMatch ? charsetMatch[1].toLowerCase().replace(/-/g, '') : 'utf8';
        // （arrayBuffer 已由 allorigins 的 JSON 字串化，無需再 decode；僅 corsproxy 需要考慮）

        // 2. 優先提取 og:title（最準確）
        const ogTitleMatch =
          html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
        if (ogTitleMatch?.[1]) {
          placeName = ogTitleMatch[1].trim();
        }

        // 3. 提取 <title>
        if (!placeName) {
          const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          const rawTitle = titleMatch ? titleMatch[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : '';
          if (rawTitle && !rawTitle.toLowerCase().includes('google search') && !rawTitle.includes('Google 地圖') && !rawTitle.includes('Google Maps')) {
            placeName = rawTitle;
          }
        }

        // 4. 提取 q= redirect query
        if (!placeName) {
          const innerQ = html.match(/[?&]q=([^&"'<>\s]+)/i);
          if (innerQ) {
            try {
              const rawQ = decodeURIComponent(innerQ[1]).replace(/\+/g, ' ');
              if (rawQ && !rawQ.startsWith('http') && rawQ.length < 60) {
                placeName = rawQ;
              }
            } catch {}
          }
        }

        // 5. 提取座標
        const coordMatch = html.match(/!3d([0-9.-]+)!4d([0-9.-]+)/) || html.match(/@([0-9.-]+),([0-9.-]+)/);
        if (coordMatch?.[1] && coordMatch?.[2]) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }

        // 6. 偵測城市
        detectedCity = detectCity(html.slice(0, 8000));

        // 若有效則不繼續嘗試下一個 proxy
        if (placeName) break;
      } catch (e) {
        console.warn('Proxy fetch warning', e);
      }
    }
  }

  // Clean placeName by removing Google suffixes
  if (placeName) {
    placeName = placeName
      .replace(/ - Google 地圖| - Google Search| - Google 搜尋| · Google Maps| \| Google Maps/gi, '')
      .trim();

    // Check if placeName matches any curated spot
    const pLower = placeName.toLowerCase();
    for (const spot of CURATED_VERIFIED_SPOTS) {
      if (spot.keywords.some((kw) => pLower.includes(kw.toLowerCase()) || kw.toLowerCase().includes(pLower))) {
        return {
          id: `curated_${Date.now()}`,
          name: spot.name,
          category: spot.category,
          city: spot.city,
          address: spot.address,
          lat: spot.lat,
          lng: spot.lng,
          googleMapsUrl: spot.googleMapsUrl || str,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${spot.name} ${spot.city} 美食 評價`)}`,
          priceRange: spot.priceRange,
          source: 'google_share',
        };
      }
    }
  }

  if (!placeName) {
    try {
      const u = new URL(str);
      const lastSeg = u.pathname.split('/').filter(Boolean).pop() || '';
      placeName = lastSeg ? decodeURIComponent(lastSeg) : 'Google 分享店家';
    } catch {
      placeName = 'Google 分享店家';
    }
  }

  if (!detectedCity || detectedCity === '台北市') {
    detectedCity = detectCity(str + ' ' + placeName);
  }

  if (CITY_COORDS[detectedCity] && (lat === 25.0478 && lng === 121.5319 && !detectedCity.includes('台北'))) {
    lat = CITY_COORDS[detectedCity].lat;
    lng = CITY_COORDS[detectedCity].lng;
  }

  const category = guessCategory(placeName);
  if (!formattedAddress) {
    formattedAddress = `${detectedCity} (${placeName})`;
  }

  return {
    id: `gshare_${Date.now()}`,
    name: placeName,
    category,
    city: detectedCity,
    address: formattedAddress,
    lat,
    lng,
    googleMapsUrl: str,
    googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${placeName} ${detectedCity} 美食 評價`)}`,
    priceRange: category.includes('燒肉') || category.includes('牛排') ? '$$$' : category.includes('早午餐') || category.includes('火鍋') ? '$$' : '$',
    source: 'google_share',
  };
}

// 🔍 Search Places Online via Multi-Engine (Curated + Photon Fuzzy + Nominatim POI + Link Resolver)
export async function searchGooglePlacesOnline(query: string, includeFallback = true): Promise<PlaceSearchResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 1) return [];

  const results: PlaceSearchResult[] = [];
  const seenKeys = new Set<string>();

  // 1. If query is a URL, resolve it directly
  if (
    cleanQ.startsWith('http://') ||
    cleanQ.startsWith('https://') ||
    cleanQ.includes('google.com') ||
    cleanQ.includes('share.google') ||
    cleanQ.includes('goo.gl')
  ) {
    const directCard = await resolveGooglePlaceUrl(cleanQ);
    if (directCard) {
      results.push(directCard);
      return results;
    }
  }

  // 2. Exact / Keyword check against Curated Verified Spots
  const qLower = cleanQ.toLowerCase();

  // 品牌核心關鍵字 → 同品牌所有分店都要顯示
  // key = 品牌識別關鍵字（含中英文）, value = 分店名稱共同包含的字串
  const CHAIN_BRAND_IDENTIFIERS: Array<{ triggers: string[]; brandMatcher: (name: string) => boolean }> = [
    {
      triggers: ['willcha', 'WILLcha', '未来茶', '未來茶', 'ウィルチャ', 'タピオカ'],
      brandMatcher: (name) => name.includes('WILLcha') || name.includes('未来茶'),
    },
    {
      triggers: ['一蘭', 'ichiran'],
      brandMatcher: (name) => name.includes('一蘭'),
    },
    {
      triggers: ['屋馬燒肉', '屋馬'],
      brandMatcher: (name) => name.includes('屋馬'),
    },
  ];

  // 判斷是否為連鎖品牌全域搜尋
  let chainBrandMatcher: ((name: string) => boolean) | null = null;
  for (const brand of CHAIN_BRAND_IDENTIFIERS) {
    if (brand.triggers.some((t) => qLower.includes(t.toLowerCase()))) {
      chainBrandMatcher = brand.brandMatcher;
      break;
    }
  }

  for (const spot of CURATED_VERIFIED_SPOTS) {
    // 連鎖品牌：把同品牌所有分店都列入
    if (chainBrandMatcher && chainBrandMatcher(spot.name)) {
      const key = (spot.name + '_' + spot.city).toLowerCase().replace(/\s/g, '');
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          id: `curated_${Date.now()}_${results.length}`,
          name: spot.name,
          category: spot.category,
          city: spot.city,
          address: spot.address,
          lat: spot.lat,
          lng: spot.lng,
          googleMapsUrl:
            spot.googleMapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${spot.address}`)}`,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${spot.name} ${spot.city} 美食 評價`)}`,
          priceRange: spot.priceRange,
          source: 'custom',
        });
      }
      continue; // 已由連鎖邏輯處理，跳過一般關鍵字比對
    }

    // 一般關鍵字比對（避免過度匹配：只允許 query 長度 >= 2 的子字串匹配）
    const isMatch = spot.keywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      // query 包含 keyword（keyword 是完整詞組）
      const qContainsKw = kwLower.length >= 2 && qLower.includes(kwLower);
      // keyword 包含 query（query 必須夠長，防止單字誤觸）
      const kwContainsQ = qLower.length >= 3 && kwLower.includes(qLower);
      return qContainsKw || kwContainsQ;
    });

    if (isMatch) {
      const key = (spot.name + '_' + spot.city).toLowerCase().replace(/\s/g, '');
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          id: `curated_${Date.now()}_${results.length}`,
          name: spot.name,
          category: spot.category,
          city: spot.city,
          address: spot.address,
          lat: spot.lat,
          lng: spot.lng,
          googleMapsUrl:
            spot.googleMapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${spot.address}`)}`,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${spot.name} ${spot.city} 美食 評價`)}`,
          priceRange: spot.priceRange,
          source: 'custom',
        });
      }
    }
  }

  // Check if query explicitly targets a specific country or region
  const queryHasJapan = /愛知|名古屋|東京|大阪|京都|福岡|博多|北海道|札幌|沖繩|橫濱|神戶|廣島|日本|三重縣|三重県|Mie/i.test(cleanQ);
  const queryHasTaiwan = /台灣|台北|新北|三重區|三重店|今大|板橋|台中|台南|高雄|桃園|新竹/i.test(cleanQ) && !cleanQ.includes('日本 三重') && !cleanQ.includes('三重縣');
  const targetCity = detectCity(cleanQ, queryHasJapan ? '東京都' : '台北市');

  // 3. Photon Engine Search
  const photonPromise = (async (): Promise<PlaceSearchResult[]> => {
    try {
      const url = `https://photon.komoot.io/api/?lang=default&limit=15&q=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.features || !Array.isArray(data.features)) return [];

      const list: PlaceSearchResult[] = [];
      data.features.forEach((f: any, idx: number) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [121.5319, 25.0478];
        const lng = coords[0];
        const lat = coords[1];

        const rawName = props.name || cleanQ;
        const street = props.street || '';
        const fullLocationText = [
          props.country,
          props.state,
          props.city,
          props.county,
          props.district,
          props.locality,
          props.suburb,
          street,
          rawName,
        ].filter(Boolean).join(' ');

        const isJapan = props.country === '日本' || props.country === 'Japan' || props.countrycode === 'JP' || queryHasJapan || /[\u3040-\u30ff]/.test(fullLocationText);
        const city = detectCity(fullLocationText, isJapan ? (props.state || '東京都') : '台北市');

        // Region sanity filter
        if (queryHasJapan && (city.includes('台北') || city.includes('新北') || city.includes('台中') || city.includes('高雄') || city.includes('台南'))) {
          return;
        }
        if (queryHasTaiwan && (city.includes('東京都') || city.includes('大阪府') || city.includes('愛知縣') || city.includes('京都府'))) {
          return;
        }

        let fullAddress = '';
        if (isJapan) {
          const pref = (props.state && props.state !== '日本') ? props.state : city;
          const municipal = props.city && props.city !== pref ? props.city : '';
          const locality = props.locality || props.suburb || (props.district && props.district !== props.city ? props.district : '') || '';
          const block = [street, props.housenumber].filter(Boolean).join('-');
          fullAddress = [pref, municipal, locality, block].filter(Boolean).join('');
        } else {
          const house = props.housenumber ? props.housenumber + '號' : '';
          fullAddress = [city, props.district || props.suburb, street, house].filter(Boolean).join('');
        }

        if (!fullAddress || fullAddress === city) {
          fullAddress = `${city} ${street || props.name || ''}`.trim();
        }

        const category = guessCategory(rawName, props.osm_value || props.osm_key || '');
        const gMapsQuery = encodeURIComponent(`${rawName} ${fullAddress}`);

        list.push({
          id: `photon_${Date.now()}_${idx}`,
          name: rawName,
          category,
          city,
          address: fullAddress || `${city} (查無詳細門牌)`,
          lat,
          lng,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${gMapsQuery}`,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${rawName} ${city} 美食 評價`)}`,
          priceRange:
            category.includes('燒肉') || category.includes('牛排')
              ? '$$$'
              : category.includes('早午餐') || category.includes('火鍋')
              ? '$$'
              : '$',
          rawType: props.osm_value,
          source: 'photon',
        });
      });
      return list;
    } catch (e) {
      console.warn('Photon search error', e);
      return [];
    }
  })();

  // 4. Nominatim Engine Search
  const nominatimPromise = (async (): Promise<PlaceSearchResult[]> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'zh-TW,zh;q=0.9,ja;q=0.8,en;q=0.7' },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      const list: PlaceSearchResult[] = [];
      data.forEach((item: any, idx: number) => {
        const rawName = item.name || (item.display_name ? item.display_name.split(',')[0] : cleanQ);
        const cleanName = rawName.trim();
        const fullLocationText = [
          item.address?.country,
          item.address?.state,
          item.address?.province,
          item.address?.city,
          item.address?.town,
          item.address?.suburb,
          item.address?.neighbourhood,
          item.display_name,
          cleanName,
        ].filter(Boolean).join(' ');
        const isJapan = item.address?.country_code === 'jp' || item.address?.country === '日本' || queryHasJapan || /[\u3040-\u30ff]/.test(fullLocationText);
        const city = detectCity(fullLocationText, isJapan ? (item.address?.state || '東京都') : '台北市');

        // Region sanity filter
        if (queryHasJapan && (city.includes('台北') || city.includes('新北') || city.includes('台中') || city.includes('高雄') || city.includes('台南'))) {
          return;
        }
        if (queryHasTaiwan && (city.includes('東京都') || city.includes('大阪府') || city.includes('愛知縣') || city.includes('京都府'))) {
          return;
        }

        let formattedAddress = item.display_name || '';
        if (item.address) {
          if (isJapan) {
            const pref = item.address.state || item.address.province || city;
            const municipal = (item.address.city || item.address.town || '') !== pref ? (item.address.city || item.address.town || '') : '';
            const locality = item.address.suburb || item.address.neighbourhood || '';
            const block = [item.address.road, item.address.house_number].filter(Boolean).join('-');
            formattedAddress = [pref, municipal, locality, block].filter(Boolean).join('');
          } else {
            const road = item.address.road || '';
            const house = item.address.house_number ? item.address.house_number + '號' : '';
            const suburb = item.address.suburb || item.address.neighbourhood || '';
            if (road) {
              formattedAddress = `${city}${suburb}${road}${house}`;
            }
          }
        }

        const lat = parseFloat(item.lat) || 25.0478;
        const lng = parseFloat(item.lon) || 121.5319;
        const category = guessCategory(cleanName, item.type || '');
        const gMapsQuery = encodeURIComponent(`${cleanName} ${formattedAddress}`);

        list.push({
          id: `nom_${Date.now()}_${idx}`,
          name: cleanName,
          category,
          city,
          address: formattedAddress || `${city} (查無詳細門牌)`,
          lat,
          lng,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${gMapsQuery}`,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${cleanName} ${city} 美食 評價`)}`,
          priceRange:
            category.includes('燒肉') || category.includes('牛排')
              ? '$$$'
              : category.includes('早午餐') || category.includes('火鍋')
              ? '$$'
              : '$',
          rawType: item.type,
          source: 'nominatim',
        });
      });
      return list;
    } catch (e) {
      console.warn('Nominatim search error', e);
      return [];
    }
  })();

  const [photonRes, nominatimRes] = await Promise.all([photonPromise, nominatimPromise]);

  // Merge and deduplicate
  [...photonRes, ...nominatimRes].forEach((item) => {
    const key = (item.name + '_' + item.city).toLowerCase().replace(/\s/g, '');
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      results.push(item);
    }
  });

  // Sort results by relevance to search query
  results.sort((a, b) => {
    const aLower = a.name.toLowerCase().replace(/[\s\-_・·『』「」【】()（）#@]/g, '');
    const bLower = b.name.toLowerCase().replace(/[\s\-_・·『』「」【】()（）#@]/g, '');
    const qLower = cleanQ.toLowerCase().replace(/[\s\-_・·『』「」【】()（）#@]/g, '');

    const aExact = aLower === qLower;
    const bExact = bLower === qLower;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const aContains = aLower.includes(qLower) || qLower.includes(aLower);
    const bContains = bLower.includes(qLower) || qLower.includes(bLower);
    if (aContains && !bContains) return -1;
    if (!aContains && bContains) return 1;

    return 0;
  });

  // Fallback: If no results after filtering, construct a clean candidate card in the target region
  // (Only when includeFallback is true, e.g. manual user search in search bar)
  if (includeFallback && results.length === 0 && cleanQ.length > 0) {
    const detected = targetCity;
    const category = guessCategory(cleanQ);
    const coords = CITY_COORDS[detected] || { lat: 25.0478, lng: 121.5319 };
    results.push({
      id: `custom_${Date.now()}`,
      name: cleanQ,
      category,
      city: detected,
      address: `${detected} (精選店家 · 可自行編輯完整地址)`,
      lat: coords.lat,
      lng: coords.lng,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQ + ' ' + detected)}`,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(cleanQ + ' ' + detected + ' 美食 評價')}`,
      priceRange: '$',
      source: 'custom',
    });
  }

  return results;
}

// 🌐 Smart URL place extraction for backward compatibility
export function parseGoogleShareUrl(urlStr: string): { placeName: string; query: string; isShareUrl: boolean } {
  const str = urlStr.trim();
  if (str.startsWith('http://') || str.startsWith('https://')) {
    try {
      const url = new URL(str);
      const qParam = url.searchParams.get('q') || url.searchParams.get('query');
      if (qParam) {
        return { placeName: qParam, query: qParam, isShareUrl: true };
      }
      const pathParts = url.pathname.split('/').filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1] || 'Google 分享店家';
      return { placeName: decodeURIComponent(lastPart), query: decodeURIComponent(lastPart), isShareUrl: true };
    } catch {
      return { placeName: 'Google 分享店家', query: str, isShareUrl: true };
    }
  }
  return { placeName: str, query: str, isShareUrl: false };
}
