// Haversine formula to calculate distance between two coordinates in km
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number, _lang: 'zh-TW' | 'ja' = 'zh-TW'): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export interface UserLocation {
  lat: number;
  lng: number;
  cityName?: string;
  isGps: boolean;
}

// 🇹🇼 台灣完整縣市與精選重點行政區
export const TAIWAN_CITIES_AND_DISTRICTS = [
  '台北市',
  '台北市 - 大安區',
  '台北市 - 信義區',
  '台北市 - 中山區',
  '台北市 - 中正區',
  '台北市 - 松山區',
  '台北市 - 大同區',
  '台北市 - 萬華區',
  '台北市 - 士林區',
  '台北市 - 北投區',
  '台北市 - 內湖區',
  '台北市 - 南港區',
  '台北市 - 文山區',
  '新北市',
  '新北市 - 三重區',
  '新北市 - 板橋區',
  '新北市 - 中和區',
  '新北市 - 永和區',
  '新北市 - 新莊區',
  '新北市 - 新店區',
  '新北市 - 蘆洲區',
  '新北市 - 汐止區',
  '新北市 - 土城區',
  '新北市 - 淡水區',
  '新北市 - 林口區',
  '新北市 - 三峽區',
  '新北市 - 鶯歌區',
  '新北市 - 樹林區',
  '基隆市',
  '桃園市',
  '桃園市 - 桃園區',
  '桃園市 - 中壢區',
  '桃園市 - 龜山區',
  '桃園市 - 蘆竹區',
  '桃園市 - 八德區',
  '桃園市 - 平鎮區',
  '新竹市',
  '新竹縣',
  '新竹縣 - 竹北市',
  '苗栗縣',
  '台中市',
  '台中市 - 西屯區',
  '台中市 - 北區',
  '台中市 - 西區',
  '台中市 - 南屯區',
  '台中市 - 南區',
  '台中市 - 中區',
  '台中市 - 北屯區',
  '台中市 - 豐原區',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '台南市',
  '台南市 - 中西區',
  '台南市 - 東區',
  '台南市 - 安平區',
  '台南市 - 北區',
  '台南市 - 永康區',
  '高雄市',
  '高雄市 - 左營區',
  '高雄市 - 鼓山區',
  '高雄市 - 三民區',
  '高雄市 - 苓雅區',
  '高雄市 - 新興區',
  '高雄市 - 鳳山區',
  '屏東縣',
  '宜蘭縣',
  '宜蘭縣 - 羅東鎮',
  '宜蘭縣 - 礁溪鄉',
  '花蓮縣',
  '台東縣',
  '澎湖縣',
  '金門縣',
  '連江縣 (馬祖)',
];

// 🇯🇵 日本 47 都道府縣 (全國完備正式規格)
export const JAPAN_ALL_PREFECTURES = [
  // 北海道・東北
  '北海道', '青森縣', '岩手縣', '宮城縣 (仙台)', '秋田縣', '山形縣', '福島縣',
  // 關東
  '東京都', '神奈川縣 (橫濱)', '埼玉縣', '千葉縣', '茨城縣', '栃木縣', '群馬縣',
  // 中部・東海・北陸
  '愛知縣 (名古屋)', '三重縣', '靜岡縣', '岐阜縣', '山梨縣', '長野縣', '新潟縣', '富山縣', '石川縣 (金澤)', '福井縣',
  // 近畿 (關西)
  '大阪府', '京都府', '兵庫縣 (神戶)', '奈良縣', '滋賀縣', '和歌山縣',
  // 中國・四國
  '廣島縣', '岡山縣', '鳥取縣', '島根縣', '山口縣', '德島縣', '香川縣 (高松)', '愛媛縣 (松山)', '高知縣',
  // 九州・沖繩
  '福岡縣 (博多)', '佐賀縣', '長崎縣', '熊本縣', '大分縣', '宮崎縣', '鹿兒島縣', '沖繩縣 (那霸)'
];

// 🇰🇷 韓國重點美食城市
export const KOREA_CITIES = [
  '首爾特別市', '釜山廣域市', '仁川廣域市', '大邱廣域市', '大田廣域市', '光州廣域市', '濟州島'
];

// 🌏 港澳與全球國際都會
export const GLOBAL_CITIES = [
  '香港', '香港 - 中環', '香港 - 尖沙咀', '香港 - 銅鑼灣', '香港 - 旺角',
  '澳門', '曼谷', '清邁', '新加坡', '吉隆坡', '胡志明市', '河內',
  '紐約', '舊金山', '洛杉磯', '倫敦', '巴黎', '羅馬', '巴塞隆納', '雪梨'
];

export const COUNTRIES_AND_REGIONS: Record<string, { label: string; cities: string[] }> = {
  'TW': {
    label: '🇹🇼 台灣 (全縣市與重點行政區)',
    cities: TAIWAN_CITIES_AND_DISTRICTS,
  },
  'JP': {
    label: '🇯🇵 日本 (47 都道府縣正式規格)',
    cities: JAPAN_ALL_PREFECTURES,
  },
  'KR': {
    label: '🇰🇷 韓國 (主要都會)',
    cities: KOREA_CITIES,
  },
  'GLOBAL': {
    label: '🌏 港澳 / 東南亞 / 歐美 (全球都會)',
    cities: GLOBAL_CITIES,
  }
};

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // 🇹🇼 台灣各縣市與主要行政區
  '台北市': { lat: 25.0478, lng: 121.5319 },
  '台北市 - 大安區': { lat: 25.0264, lng: 121.5435 },
  '大安區': { lat: 25.0264, lng: 121.5435 },
  '台北市 - 信義區': { lat: 25.0330, lng: 121.5654 },
  '信義區': { lat: 25.0330, lng: 121.5654 },
  '台北市 - 中山區': { lat: 25.0685, lng: 121.5329 },
  '中山區': { lat: 25.0685, lng: 121.5329 },
  '台北市 - 中正區': { lat: 25.0324, lng: 121.5190 },
  '中正區': { lat: 25.0324, lng: 121.5190 },
  '台北市 - 松山區': { lat: 25.0587, lng: 121.5583 },
  '松山區': { lat: 25.0587, lng: 121.5583 },
  '台北市 - 大同區': { lat: 25.0632, lng: 121.5133 },
  '大同區': { lat: 25.0632, lng: 121.5133 },
  '台北市 - 萬華區': { lat: 25.0354, lng: 121.4997 },
  '萬華區': { lat: 25.0354, lng: 121.4997 },
  '台北市 - 士林區': { lat: 25.0922, lng: 121.5245 },
  '士林區': { lat: 25.0922, lng: 121.5245 },
  '台北市 - 北投區': { lat: 25.1321, lng: 121.4987 },
  '北投區': { lat: 25.1321, lng: 121.4987 },
  '台北市 - 內湖區': { lat: 25.0835, lng: 121.5878 },
  '內湖區': { lat: 25.0835, lng: 121.5878 },
  '台北市 - 南港區': { lat: 25.0553, lng: 121.6074 },
  '南港區': { lat: 25.0553, lng: 121.6074 },
  '台北市 - 文山區': { lat: 24.9987, lng: 121.5701 },
  '文山區': { lat: 24.9987, lng: 121.5701 },

  '新北市': { lat: 25.0118, lng: 121.4658 },
  '新北市 - 三重區': { lat: 25.0628, lng: 121.4988 },
  '三重區': { lat: 25.0628, lng: 121.4988 },
  '三重': { lat: 25.0628, lng: 121.4988 },
  '新北市 - 板橋區': { lat: 25.0118, lng: 121.4658 },
  '板橋區': { lat: 25.0118, lng: 121.4658 },
  '板橋': { lat: 25.0118, lng: 121.4658 },
  '新北市 - 中和區': { lat: 24.9996, lng: 121.4999 },
  '中和區': { lat: 24.9996, lng: 121.4999 },
  '新北市 - 永和區': { lat: 25.0084, lng: 121.5152 },
  '永和區': { lat: 25.0084, lng: 121.5152 },
  '新北市 - 新莊區': { lat: 25.0375, lng: 121.4489 },
  '新莊區': { lat: 25.0375, lng: 121.4489 },
  '新北市 - 新店區': { lat: 24.9680, lng: 121.5416 },
  '新店區': { lat: 24.9680, lng: 121.5416 },
  '新北市 - 蘆洲區': { lat: 25.0849, lng: 121.4746 },
  '蘆洲區': { lat: 25.0849, lng: 121.4746 },
  '新北市 - 汐止區': { lat: 25.0630, lng: 121.6645 },
  '汐止區': { lat: 25.0630, lng: 121.6645 },
  '新北市 - 土城區': { lat: 24.9723, lng: 121.4439 },
  '土城區': { lat: 24.9723, lng: 121.4439 },
  '新北市 - 淡水區': { lat: 25.1726, lng: 121.4441 },
  '淡水區': { lat: 25.1726, lng: 121.4441 },
  '新北市 - 林口區': { lat: 25.0776, lng: 121.3917 },
  '林口區': { lat: 25.0776, lng: 121.3917 },
  '新北市 - 三峽區': { lat: 24.9344, lng: 121.3689 },
  '新北市 - 鶯歌區': { lat: 24.9547, lng: 121.3547 },
  '新北市 - 樹林區': { lat: 24.9909, lng: 121.4247 },

  '基隆市': { lat: 25.1276, lng: 121.7392 },
  '桃園市': { lat: 24.9936, lng: 121.3010 },
  '桃園市 - 桃園區': { lat: 24.9936, lng: 121.3010 },
  '桃園市 - 中壢區': { lat: 24.9654, lng: 121.2250 },
  '桃園市 - 龜山區': { lat: 25.0000, lng: 121.3400 },
  '桃園市 - 蘆竹區': { lat: 25.0450, lng: 121.2900 },
  '桃園市 - 八德區': { lat: 24.9300, lng: 121.2800 },
  '桃園市 - 平鎮區': { lat: 24.9400, lng: 121.2100 },

  '新竹市': { lat: 24.8138, lng: 120.9675 },
  '新竹縣': { lat: 24.8387, lng: 121.0177 },
  '新竹縣 - 竹北市': { lat: 24.8387, lng: 121.0177 },
  '苗栗縣': { lat: 24.5602, lng: 120.8214 },

  '台中市': { lat: 24.1477, lng: 120.6736 },
  '台中市 - 西屯區': { lat: 24.1812, lng: 120.6171 },
  '西屯區': { lat: 24.1812, lng: 120.6171 },
  '台中市 - 北區': { lat: 24.1620, lng: 120.6830 },
  '台中市 - 西區': { lat: 24.1480, lng: 120.6620 },
  '台中市 - 南屯區': { lat: 24.1370, lng: 120.6390 },
  '台中市 - 南區': { lat: 24.1200, lng: 120.6600 },
  '台中市 - 中區': { lat: 24.1430, lng: 120.6830 },
  '台中市 - 北屯區': { lat: 24.1700, lng: 120.7000 },
  '台中市 - 豐原區': { lat: 24.2500, lng: 120.7200 },

  '彰化縣': { lat: 24.0518, lng: 120.5161 },
  '南投縣': { lat: 23.9609, lng: 120.9719 },
  '雲林縣': { lat: 23.7092, lng: 120.4313 },
  '嘉義市': { lat: 23.4800, lng: 120.4491 },
  '嘉義縣': { lat: 23.4518, lng: 120.2555 },

  '台南市': { lat: 22.9997, lng: 120.2270 },
  '台南市 - 中西區': { lat: 22.9920, lng: 120.1980 },
  '台南市 - 東區': { lat: 22.9860, lng: 120.2270 },
  '台南市 - 安平區': { lat: 23.0000, lng: 120.1600 },
  '台南市 - 北區': { lat: 23.0100, lng: 120.2000 },
  '台南市 - 永康區': { lat: 23.0300, lng: 120.2500 },

  '高雄市': { lat: 22.6273, lng: 120.3014 },
  '高雄市 - 左營區': { lat: 22.6896, lng: 120.2965 },
  '左營區': { lat: 22.6896, lng: 120.2965 },
  '高雄市 - 鼓山區': { lat: 22.6450, lng: 120.2780 },
  '高雄市 - 三民區': { lat: 22.6450, lng: 120.3120 },
  '高雄市 - 苓雅區': { lat: 22.6230, lng: 120.3120 },
  '高雄市 - 新興區': { lat: 22.6310, lng: 120.3060 },
  '高雄市 - 鳳山區': { lat: 22.6270, lng: 120.3570 },

  '屏東縣': { lat: 22.5519, lng: 120.5487 },
  '宜蘭縣': { lat: 24.7021, lng: 121.7377 },
  '宜蘭縣 - 羅東鎮': { lat: 24.6750, lng: 121.7700 },
  '宜蘭縣 - 礁溪鄉': { lat: 24.8250, lng: 121.7700 },
  '花蓮縣': { lat: 23.9871, lng: 121.6015 },
  '台東縣': { lat: 22.7583, lng: 121.1444 },
  '澎湖縣': { lat: 23.5711, lng: 119.5793 },
  '金門縣': { lat: 24.4493, lng: 118.3766 },
  '連江縣': { lat: 26.1505, lng: 119.9499 },
  '連江縣 (馬祖)': { lat: 26.1505, lng: 119.9499 },

  // 🇯🇵 日本 47 都道府縣 + 重點城市精準經緯度
  '北海道': { lat: 43.0642, lng: 141.3469 },
  '札幌': { lat: 43.0642, lng: 141.3469 },
  '青森縣': { lat: 40.8244, lng: 140.7400 },
  '岩手縣': { lat: 39.7036, lng: 141.1527 },
  '宮城縣': { lat: 38.2682, lng: 140.8694 },
  '宮城縣 (仙台)': { lat: 38.2682, lng: 140.8694 },
  '仙台': { lat: 38.2682, lng: 140.8694 },
  '秋田縣': { lat: 39.7186, lng: 140.1024 },
  '山形縣': { lat: 38.2404, lng: 140.3633 },
  '福島縣': { lat: 37.7500, lng: 140.4678 },

  '茨城縣': { lat: 36.3418, lng: 140.4468 },
  '栃木縣': { lat: 36.5657, lng: 139.8836 },
  '群馬縣': { lat: 36.3911, lng: 139.0608 },
  '埼玉縣': { lat: 35.8617, lng: 139.6455 },
  '千葉縣': { lat: 35.6073, lng: 140.1063 },
  '東京都': { lat: 35.6762, lng: 139.6503 },
  '東京': { lat: 35.6762, lng: 139.6503 },
  '新宿': { lat: 35.6938, lng: 139.7034 },
  '澀谷': { lat: 35.6580, lng: 139.7016 },
  '銀座': { lat: 35.6719, lng: 139.7640 },
  '神奈川縣': { lat: 35.4478, lng: 139.6425 },
  '神奈川縣 (橫濱)': { lat: 35.4478, lng: 139.6425 },
  '橫濱': { lat: 35.4478, lng: 139.6425 },

  '新潟縣': { lat: 37.9022, lng: 139.0232 },
  '富山縣': { lat: 36.6953, lng: 137.2113 },
  '石川縣': { lat: 36.5947, lng: 136.6256 },
  '石川縣 (金澤)': { lat: 36.5947, lng: 136.6256 },
  '金澤': { lat: 36.5947, lng: 136.6256 },
  '福井縣': { lat: 36.0652, lng: 136.2216 },
  '山梨縣': { lat: 35.6639, lng: 138.5683 },
  '長野縣': { lat: 36.6513, lng: 138.1810 },
  '岐阜縣': { lat: 35.4233, lng: 136.7607 },
  '靜岡縣': { lat: 34.9756, lng: 138.3828 },
  '愛知縣': { lat: 35.1802, lng: 136.9066 },
  '愛知縣 (名古屋)': { lat: 35.1802, lng: 136.9066 },
  '名古屋': { lat: 35.1815, lng: 136.9066 },
  '三重縣': { lat: 34.7303, lng: 136.5086 },
  '三重縣 (日本)': { lat: 34.7303, lng: 136.5086 },

  '滋賀縣': { lat: 35.0045, lng: 135.8686 },
  '京都府': { lat: 35.0116, lng: 135.7681 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  '大阪府': { lat: 34.6937, lng: 135.5023 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  '難波': { lat: 34.6669, lng: 135.5008 },
  '梅田': { lat: 34.7025, lng: 135.4959 },
  '兵庫縣': { lat: 34.6913, lng: 135.1830 },
  '兵庫縣 (神戶)': { lat: 34.6913, lng: 135.1830 },
  '神戶': { lat: 34.6913, lng: 135.1830 },
  '奈良縣': { lat: 34.6851, lng: 135.8048 },
  '和歌山縣': { lat: 34.2260, lng: 135.1675 },

  '鳥取縣': { lat: 35.5011, lng: 134.2351 },
  '島根縣': { lat: 35.4723, lng: 133.0505 },
  '岡山縣': { lat: 34.6618, lng: 133.9344 },
  '廣島縣': { lat: 34.3853, lng: 132.4553 },
  '山口縣': { lat: 34.1861, lng: 131.4705 },
  '德島縣': { lat: 34.0703, lng: 134.5548 },
  '香川縣': { lat: 34.3401, lng: 134.0433 },
  '香川縣 (高松)': { lat: 34.3401, lng: 134.0433 },
  '愛媛縣': { lat: 33.8417, lng: 132.7657 },
  '愛媛縣 (松山)': { lat: 33.8417, lng: 132.7657 },
  '高知縣': { lat: 33.5597, lng: 133.5311 },

  '福岡縣': { lat: 33.5904, lng: 130.4017 },
  '福岡縣 (博多)': { lat: 33.5904, lng: 130.4017 },
  '福岡': { lat: 33.5904, lng: 130.4017 },
  '博多': { lat: 33.5904, lng: 130.4017 },
  '佐賀縣': { lat: 33.2635, lng: 130.3009 },
  '長崎縣': { lat: 32.7503, lng: 129.8777 },
  '熊本縣': { lat: 32.7898, lng: 130.7417 },
  '大分縣': { lat: 33.2382, lng: 131.6126 },
  '宮崎縣': { lat: 31.9077, lng: 131.4202 },
  '鹿兒島縣': { lat: 31.5966, lng: 130.5571 },
  '沖繩縣': { lat: 26.2124, lng: 127.6809 },
  '沖繩縣 (那霸)': { lat: 26.2124, lng: 127.6809 },
  '那霸': { lat: 26.2124, lng: 127.6809 },

  // 🇰🇷 韓國
  '首爾': { lat: 37.5665, lng: 126.9780 },
  '首爾特別市': { lat: 37.5665, lng: 126.9780 },
  '釜山': { lat: 35.1796, lng: 129.0756 },
  '釜山廣域市': { lat: 35.1796, lng: 129.0756 },
  '仁川': { lat: 37.4563, lng: 126.7052 },
  '仁川廣域市': { lat: 37.4563, lng: 126.7052 },
  '大邱': { lat: 35.8714, lng: 128.6014 },
  '大邱廣域市': { lat: 35.8714, lng: 128.6014 },
  '大田廣域市': { lat: 36.3504, lng: 127.3845 },
  '光州廣域市': { lat: 35.1595, lng: 126.8526 },
  '濟州島': { lat: 33.4996, lng: 126.5312 },

  // 🌏 國際都會
  '香港': { lat: 22.3193, lng: 114.1694 },
  '香港 - 中環': { lat: 22.2820, lng: 114.1582 },
  '香港 - 尖沙咀': { lat: 22.2988, lng: 114.1722 },
  '香港 - 銅鑼灣': { lat: 22.2800, lng: 114.1850 },
  '香港 - 旺角': { lat: 22.3193, lng: 114.1694 },
  '澳門': { lat: 22.1987, lng: 113.5439 },
  '曼谷': { lat: 13.7563, lng: 100.5018 },
  '清邁': { lat: 18.7883, lng: 98.9853 },
  '新加坡': { lat: 1.3521, lng: 103.8198 },
  '吉隆坡': { lat: 3.1390, lng: 101.6869 },
  '胡志明市': { lat: 10.8231, lng: 106.6297 },
  '河內': { lat: 21.0285, lng: 105.8542 },
  '紐約': { lat: 40.7128, lng: -74.0060 },
  '舊金山': { lat: 37.7749, lng: -122.4194 },
  '洛杉磯': { lat: 34.0522, lng: -118.2437 },
  '倫敦': { lat: 51.5074, lng: -0.1278 },
  '巴黎': { lat: 48.8566, lng: 2.3522 },
  '羅馬': { lat: 41.9028, lng: 12.4964 },
  '巴塞隆納': { lat: 41.3851, lng: 2.1734 },
  '雪梨': { lat: -33.8688, lng: 151.2093 },
};

export function getCountryCodeByCity(city: string): string {
  for (const [code, info] of Object.entries(COUNTRIES_AND_REGIONS)) {
    if (info.cities.some(c => c.includes(city) || city.includes(c))) {
      return code;
    }
  }
  return 'TW';
}

// 🧭 Smart City & District Detection
export function detectCity(addrText: string): string {
  const text = (addrText || '').replace(/臺/g, '台');

  // 1. 🇹🇼 Taiwan specific district matching (e.g. 三重, 板橋, 大安, 西屯...)
  if (text.includes('三重區') || (text.includes('三重') && !text.includes('三重縣') && !text.includes('三重県') && !text.includes('Mie'))) {
    return '新北市 - 三重區';
  }
  if (text.includes('板橋')) return '新北市 - 板橋區';
  if (text.includes('中和')) return '新北市 - 中和區';
  if (text.includes('永和')) return '新北市 - 永和區';
  if (text.includes('新莊')) return '新北市 - 新莊區';
  if (text.includes('新店')) return '新北市 - 新店區';
  if (text.includes('蘆洲')) return '新北市 - 蘆洲區';
  if (text.includes('汐止')) return '新北市 - 汐止區';
  if (text.includes('土城')) return '新北市 - 土城區';
  if (text.includes('淡水')) return '新北市 - 淡水區';
  if (text.includes('林口')) return '新北市 - 林口區';
  if (text.includes('大安')) return '台北市 - 大安區';
  if (text.includes('信義')) return '台北市 - 信義區';
  if (text.includes('中山')) return '台北市 - 中山區';
  if (text.includes('中正')) return '台北市 - 中正區';
  if (text.includes('松山')) return '台北市 - 松山區';
  if (text.includes('大同')) return '台北市 - 大同區';
  if (text.includes('萬華')) return '台北市 - 萬華區';
  if (text.includes('士林')) return '台北市 - 士林區';
  if (text.includes('北投')) return '台北市 - 北投區';
  if (text.includes('內湖')) return '台北市 - 內湖區';
  if (text.includes('南港')) return '台北市 - 南港區';
  if (text.includes('文山')) return '台北市 - 文山區';
  if (text.includes('西屯')) return '台中市 - 西屯區';
  if (text.includes('左營')) return '高雄市 - 左營區';
  if (text.includes('中壢')) return '桃園市 - 中壢區';
  if (text.includes('竹北')) return '新竹縣 - 竹北市';

  // 2. 🇯🇵 Japan 47 Prefectures Detection
  if (text.includes('三重縣') || text.includes('三重県') || text.includes('Mie')) return '三重縣';
  if (text.includes('愛知') || text.includes('名古屋') || text.includes('Aichi') || text.includes('Nagoya')) return '愛知縣 (名古屋)';
  if (text.includes('東京') || text.includes('Tokyo') || text.includes('新宿') || text.includes('澀谷') || text.includes('銀座')) return '東京都';
  if (text.includes('大阪') || text.includes('Osaka') || text.includes('難波') || text.includes('梅田')) return '大阪府';
  if (text.includes('京都') || text.includes('Kyoto')) return '京都府';
  if (text.includes('福岡') || text.includes('博多') || text.includes('Fukuoka')) return '福岡縣 (博多)';
  if (text.includes('北海道') || text.includes('札幌') || text.includes('Hokkaido')) return '北海道';
  if (text.includes('沖繩') || text.includes('那霸') || text.includes('Okinawa')) return '沖繩縣 (那霸)';
  if (text.includes('神奈川') || text.includes('橫濱') || text.includes('Yokohama')) return '神奈川縣 (橫濱)';
  if (text.includes('兵庫') || text.includes('神戶') || text.includes('Kobe')) return '兵庫縣 (神戶)';
  if (text.includes('廣島') || text.includes('Hiroshima')) return '廣島縣';
  if (text.includes('宮城') || text.includes('仙台') || text.includes('Sendai')) return '宮城縣 (仙台)';
  if (text.includes('靜岡') || text.includes('Shizuoka')) return '靜岡縣';
  if (text.includes('奈良') || text.includes('Nara')) return '奈良縣';
  if (text.includes('長野') || text.includes('Nagano')) return '長野縣';
  if (text.includes('石川') || text.includes('金澤') || text.includes('Kanazawa')) return '石川縣 (金澤)';
  if (text.includes('埼玉') || text.includes('Saitama')) return '埼玉縣';
  if (text.includes('千葉') || text.includes('Chiba')) return '千葉縣';
  if (text.includes('熊本') || text.includes('Kumamoto')) return '熊本縣';
  if (text.includes('鹿兒島') || text.includes('Kagoshima')) return '鹿兒島縣';
  if (text.includes('岐阜') || text.includes('Gifu')) return '岐阜縣';
  if (text.includes('滋賀') || text.includes('Shiga')) return '滋賀縣';
  if (text.includes('和歌山') || text.includes('Wakayama')) return '和歌山縣';
  if (text.includes('岡山') || text.includes('Okayama')) return '岡山縣';
  if (text.includes('香川') || text.includes('高松') || text.includes('Takamatsu')) return '香川縣 (高松)';
  if (text.includes('愛媛') || text.includes('松山')) return '愛媛縣 (松山)';
  if (text.includes('長崎') || text.includes('Nagasaki')) return '長崎縣';
  if (text.includes('大分') || text.includes('Oita')) return '大分縣';
  if (text.includes('宮崎') || text.includes('Miyazaki')) return '宮崎縣';
  if (text.includes('青森') || text.includes('Aomori')) return '青森縣';
  if (text.includes('岩手') || text.includes('Iwate')) return '岩手縣';
  if (text.includes('秋田') || text.includes('Akita')) return '秋田縣';
  if (text.includes('山形') || text.includes('Yamagata')) return '山形縣';
  if (text.includes('福島') || text.includes('Fukushima')) return '福島縣';
  if (text.includes('茨城') || text.includes('Ibaraki')) return '茨城縣';
  if (text.includes('栃木') || text.includes('Tochigi')) return '栃木縣';
  if (text.includes('群馬') || text.includes('Gunma')) return '群馬縣';
  if (text.includes('新潟') || text.includes('Niigata')) return '新潟縣';
  if (text.includes('富山') || text.includes('Toyama')) return '富山縣';
  if (text.includes('福井') || text.includes('Fukui')) return '福井縣';
  if (text.includes('山梨') || text.includes('Yamanashi')) return '山梨縣';
  if (text.includes('鳥取') || text.includes('Tottori')) return '鳥取縣';
  if (text.includes('島根') || text.includes('Shimane')) return '島根縣';
  if (text.includes('山口') || text.includes('Yamaguchi')) return '山口縣';
  if (text.includes('德島') || text.includes('Tokushima')) return '德島縣';
  if (text.includes('高知') || text.includes('Kochi')) return '高知縣';
  if (text.includes('佐賀') || text.includes('Saga')) return '佐賀縣';

  // 3. 🇹🇼 Taiwan Cities & Counties
  if (text.includes('台北') || text.includes('Taipei')) return '台北市';
  if (text.includes('新北') || text.includes('New Taipei')) return '新北市';
  if (text.includes('台中') || text.includes('Taichung')) return '台中市';
  if (text.includes('台南') || text.includes('Tainan')) return '台南市';
  if (text.includes('高雄') || text.includes('Kaohsiung')) return '高雄市';
  if (text.includes('新竹市')) return '新竹市';
  if (text.includes('新竹縣') || text.includes('新竹')) return '新竹縣';
  if (text.includes('桃園') || text.includes('Taoyuan')) return '桃園市';
  if (text.includes('基隆') || text.includes('Keelung')) return '基隆市';
  if (text.includes('宜蘭') || text.includes('Yilan')) return '宜蘭縣';
  if (text.includes('彰化') || text.includes('Changhua')) return '彰化縣';
  if (text.includes('苗栗') || text.includes('Miaoli')) return '苗栗縣';
  if (text.includes('南投') || text.includes('Nantou')) return '南投縣';
  if (text.includes('雲林') || text.includes('Yunlin')) return '雲林縣';
  if (text.includes('嘉義市')) return '嘉義市';
  if (text.includes('嘉義縣') || text.includes('嘉義')) return '嘉義縣';
  if (text.includes('屏東') || text.includes('Pingtung')) return '屏東縣';
  if (text.includes('花蓮') || text.includes('Hualien')) return '花蓮縣';
  if (text.includes('台東') || text.includes('Taitung')) return '台東縣';
  if (text.includes('澎湖') || text.includes('Penghu')) return '澎湖縣';
  if (text.includes('金門') || text.includes('Kinmen')) return '金門縣';
  if (text.includes('連江') || text.includes('馬祖')) return '連江縣 (馬祖)';

  // 4. 🇰🇷 韓國 & 🌏 全球
  if (text.includes('首爾') || text.includes('Seoul')) return '首爾特別市';
  if (text.includes('釜山') || text.includes('Busan')) return '釜山廣域市';
  if (text.includes('香港') || text.includes('Hong Kong')) return '香港';
  if (text.includes('澳門') || text.includes('Macau')) return '澳門';
  if (text.includes('曼谷') || text.includes('Bangkok')) return '曼谷';
  if (text.includes('新加坡') || text.includes('Singapore')) return '新加坡';

  return '台北市';
}

// 🧭 Find nearest city name from GPS coordinates (Taiwan, Japan, Global)
export function findNearestCity(lat: number, lng: number): { cityName: string; countryCode: string; distanceKm: number } {
  let minDistance = Infinity;
  let nearestCity = '台北市';

  for (const [cityName, coords] of Object.entries(CITY_COORDS)) {
    const dist = calculateDistanceKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = cityName;
    }
  }

  const countryCode = getCountryCodeByCity(nearestCity);
  const countryFlag = countryCode === 'JP' ? '🇯🇵 ' : countryCode === 'KR' ? '🇰🇷 ' : countryCode === 'TW' ? '🇹🇼 ' : '🌏 ';

  return {
    cityName: `${countryFlag}${nearestCity}`,
    countryCode,
    distanceKm: minDistance,
  };
}
