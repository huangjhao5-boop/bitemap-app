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

// 🇨🇳 中國大陸重點美食城市
export const CHINA_CITIES = [
  '上海市', '北京市', '廣州市', '深圳市', '成都市', '杭州市', '武漢市', '重慶市', '南京市', '廈門市', '青島市', '西安市', '蘇州市', '天津市', '長沙市'
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
  'CN': {
    label: '🇨🇳 中國大陸 (主要美食都會)',
    cities: CHINA_CITIES,
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
  '三重縣 (鈴鹿市)': { lat: 34.8824, lng: 136.5847 },
  '鈴鹿': { lat: 34.8824, lng: 136.5847 },
  '鈴鹿市': { lat: 34.8824, lng: 136.5847 },
  '三重縣 (四日市市)': { lat: 34.9660, lng: 136.6247 },
  '四日市': { lat: 34.9660, lng: 136.6247 },
  '四日市市': { lat: 34.9660, lng: 136.6247 },
  '三重縣 (伊勢市)': { lat: 34.4855, lng: 136.7089 },
  '伊勢': { lat: 34.4855, lng: 136.7089 },
  '伊勢市': { lat: 34.4855, lng: 136.7089 },
  '三重縣 (松阪市)': { lat: 34.5784, lng: 136.5358 },
  '松阪': { lat: 34.5784, lng: 136.5358 },
  '松阪市': { lat: 34.5784, lng: 136.5358 },
  '三重縣 (津市)': { lat: 34.7303, lng: 136.5086 },
  '津市': { lat: 34.7303, lng: 136.5086 },

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
  '鳥取': { lat: 35.5011, lng: 134.2351 },
  '鳥取市': { lat: 35.5011, lng: 134.2351 },
  '島根縣': { lat: 35.4723, lng: 133.0505 },
  '島根': { lat: 35.4723, lng: 133.0505 },
  '松江': { lat: 35.4723, lng: 133.0505 },
  '岡山縣': { lat: 34.6618, lng: 133.9344 },
  '岡山': { lat: 34.6618, lng: 133.9344 },
  '岡山市': { lat: 34.6618, lng: 133.9344 },
  '倉敷': { lat: 34.5847, lng: 133.7712 },
  '倉敷市': { lat: 34.5847, lng: 133.7712 },
  '廣島縣': { lat: 34.3853, lng: 132.4553 },
  '廣島': { lat: 34.3853, lng: 132.4553 },
  '廣島市': { lat: 34.3853, lng: 132.4553 },
  '山口縣': { lat: 34.1861, lng: 131.4705 },
  '山口': { lat: 34.1861, lng: 131.4705 },
  '德島縣': { lat: 34.0703, lng: 134.5548 },
  '德島': { lat: 34.0703, lng: 134.5548 },
  '香川縣': { lat: 34.3401, lng: 134.0433 },
  '香川縣 (高松)': { lat: 34.3401, lng: 134.0433 },
  '香川縣 (高松市)': { lat: 34.3401, lng: 134.0433 },
  '香川': { lat: 34.3401, lng: 134.0433 },
  '高松': { lat: 34.3401, lng: 134.0433 },
  '高松市': { lat: 34.3401, lng: 134.0433 },
  '愛媛縣': { lat: 33.8417, lng: 132.7657 },
  '愛媛縣 (松山)': { lat: 33.8417, lng: 132.7657 },
  '愛媛': { lat: 33.8417, lng: 132.7657 },
  '松山市': { lat: 33.8417, lng: 132.7657 },
  '高知縣': { lat: 33.5597, lng: 133.5311 },
  '高知': { lat: 33.5597, lng: 133.5311 },
  '高知市': { lat: 33.5597, lng: 133.5311 },

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

  // 🇨🇳 中國大陸重點都會
  '上海市': { lat: 31.2304, lng: 121.4737 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '北京市': { lat: 39.9042, lng: 116.4074 },
  '北京': { lat: 39.9042, lng: 116.4074 },
  '廣州市': { lat: 23.1291, lng: 113.2644 },
  '廣州': { lat: 23.1291, lng: 113.2644 },
  '深圳市': { lat: 22.5431, lng: 114.0579 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '成都市': { lat: 30.5728, lng: 104.0668 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '杭州市': { lat: 30.2741, lng: 120.1551 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '武漢市': { lat: 30.5928, lng: 114.3055 },
  '武漢': { lat: 30.5928, lng: 114.3055 },
  '重慶市': { lat: 29.5630, lng: 106.5516 },
  '重慶': { lat: 29.5630, lng: 106.5516 },
  '南京市': { lat: 32.0603, lng: 118.7969 },
  '南京': { lat: 32.0603, lng: 118.7969 },
  '廈門市': { lat: 24.4798, lng: 118.0894 },
  '廈門': { lat: 24.4798, lng: 118.0894 },
  '青島市': { lat: 36.0671, lng: 120.3826 },
  '青島': { lat: 36.0671, lng: 120.3826 },
  '西安市': { lat: 34.3416, lng: 108.9398 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '蘇州市': { lat: 31.2989, lng: 120.5853 },
  '蘇州': { lat: 31.2989, lng: 120.5853 },
  '天津市': { lat: 39.3434, lng: 117.3616 },
  '天津': { lat: 39.3434, lng: 117.3616 },
  '長沙市': { lat: 28.2282, lng: 112.9388 },
  '長沙': { lat: 28.2282, lng: 112.9388 },

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

// 🧭 Smart Universal City & District Detection (Dynamic Regex for Japan, Taiwan & Global)
export function detectCity(addrText: string, fallback: string = '台北市'): string {
  if (!addrText || !addrText.trim()) return fallback;
  const text = addrText.replace(/臺/g, '台');

  // 1. 🇹🇼 Special Disambiguation for Taiwan landmarks & Sanchong District vs Japan Mie Prefecture / Chugoku
  if (text.includes('中國醫') || text.includes('中國醫藥大學')) {
    return '台中市 - 北區';
  }
  if (text.includes('中國文化大學') || text.includes('文化大學')) {
    return '台北市 - 士林區';
  }
  if (text.includes('中國科技大學')) {
    return '台北市 - 文山區';
  }
  if (text.includes('中國信託') || text.includes('中信金融園區')) {
    return '台北市 - 南港區';
  }
  if (
    text.includes('三重區') ||
    text.includes('新北三重') ||
    text.includes('三重捷運') ||
    text.includes('三重國小') ||
    (text.includes('三重') && (text.includes('新北') || text.includes('今大') || text.includes('大仁街') || text.includes('自強路') || text.includes('店小二') || text.includes('唯豐') || text.includes('五燈獎')))
  ) {
    return '新北市 - 三重區';
  }

  // 2. 🇯🇵 Japanese Address & Region Universal Parser (都道府県 + 市区町村)
  // Match Japanese Prefecture (e.g., 香川県, 岡山県, 三重県, 東京都, 大阪府, 北海道...)
  const jpPrefMatch = text.match(/([一-龠ぁ-ゔァ-ヴ]+?(?:都|府|県))/);
  // Match Japanese Municipality (e.g., 高松市, 岡山市, 倉敷市, 鈴鹿市, 金沢市, 函館市, 新宿区...)
  const jpMuniMatch = text.match(/([一-龠ぁ-ゔァ-ヴ]+?(?:市|区|町|村))/);

  if (jpPrefMatch || jpMuniMatch) {
    const pref = jpPrefMatch ? jpPrefMatch[1].replace(/県$/, '縣') : '';
    const muni = jpMuniMatch ? jpMuniMatch[1] : '';

    if (pref && muni && !pref.includes(muni)) {
      return `${pref} (${muni})`;
    }
    if (pref) return pref;
    if (muni) return muni;
  }

  // 3. Check known city/prefecture lookup keys (e.g. "高松", "岡山", "金澤", "鈴鹿", "博多", "難波")
  for (const key of Object.keys(CITY_COORDS)) {
    if (key.length >= 2 && text.includes(key)) {
      return key;
    }
  }

  // 4. 🇹🇼 Taiwan Address & District Universal Parser (縣市 + 鄉鎮市區)
  const twCountyMatch = text.match(/([一-龠]+?(?:縣|市))/);
  const twDistrictMatch = text.match(/([一-龠]+?(?:區|鄉|鎮))/);

  if (twCountyMatch || twDistrictMatch) {
    const county = twCountyMatch ? twCountyMatch[1] : '';
    const district = twDistrictMatch ? twDistrictMatch[1] : '';

    if (county && district) {
      return `${county} - ${district}`;
    }
    if (county) return county;
    if (district) return district;
  }

  // 5. 🇰🇷 Korea & 🌏 Global Cities
  if (text.includes('首爾') || text.includes('Seoul')) return '首爾特別市';
  if (text.includes('釜山') || text.includes('Busan')) return '釜山廣域市';
  if (text.includes('香港') || text.includes('Hong Kong')) return '香港';
  if (text.includes('澳門') || text.includes('Macau')) return '澳門';
  if (text.includes('曼谷') || text.includes('Bangkok')) return '曼谷';

  if (text.includes('日本') || text.includes('Japan') || text.includes('JP') || /[ぁ-んァ-ヶ]/.test(text)) {
    return '東京都';
  }

  return fallback;
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
  const countryFlag = countryCode === 'JP' ? '🇯🇵 ' : countryCode === 'CN' ? '🇨🇳 ' : countryCode === 'KR' ? '🇰🇷 ' : countryCode === 'TW' ? '🇹🇼 ' : '🌏 ';

  return {
    cityName: `${countryFlag}${nearestCity}`,
    countryCode,
    distanceKm: minDistance,
  };
}
