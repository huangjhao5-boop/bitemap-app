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

export const COUNTRIES_AND_REGIONS: Record<string, { label: string; cities: string[] }> = {
  'TW': {
    label: '🇹🇼 台灣 (Taiwan)',
    cities: [
      '台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', 
      '苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', 
      '嘉義縣', '台南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', 
      '台東縣', '澎湖縣', '金門縣', '連江縣'
    ]
  },
  'JP': {
    label: '🇯🇵 日本 (Japan)',
    cities: [
      '愛知縣', '東京都', '大阪府', '京都府', '福岡縣', '北海道', 
      '神奈川縣', '沖繩縣', '兵庫縣', '廣島縣', '宮城縣', '靜岡縣', 
      '奈良縣', '長野縣', '石川縣', '埼玉縣', '千葉縣', '熊本縣', '鹿兒島縣'
    ]
  },
  'KR': {
    label: '🇰🇷 韓國 (South Korea)',
    cities: ['首爾', '釜山', '仁川', '大邱', '濟州島']
  },
  'GLOBAL': {
    label: '🌏 港澳 / 東南亞 / 歐美 (Global)',
    cities: ['香港', '澳門', '曼谷', '新加坡', '紐約', '倫敦', '巴黎']
  }
};

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // 🇹🇼 台灣各縣市
  '台北市': { lat: 25.0478, lng: 121.5319 },
  '新北市': { lat: 25.0118, lng: 121.4658 },
  '基隆市': { lat: 25.1276, lng: 121.7392 },
  '桃園市': { lat: 24.9936, lng: 121.3010 },
  '新竹市': { lat: 24.8138, lng: 120.9675 },
  '新竹縣': { lat: 24.8387, lng: 121.0177 },
  '苗栗縣': { lat: 24.5602, lng: 120.8214 },
  '台中市': { lat: 24.1477, lng: 120.6736 },
  '彰化縣': { lat: 24.0518, lng: 120.5161 },
  '南投縣': { lat: 23.9609, lng: 120.9719 },
  '雲林縣': { lat: 23.7092, lng: 120.4313 },
  '嘉義市': { lat: 23.4800, lng: 120.4491 },
  '嘉義縣': { lat: 23.4518, lng: 120.2555 },
  '台南市': { lat: 22.9997, lng: 120.2270 },
  '高雄市': { lat: 22.6273, lng: 120.3014 },
  '屏東縣': { lat: 22.5519, lng: 120.5487 },
  '宜蘭縣': { lat: 24.7021, lng: 121.7377 },
  '花蓮縣': { lat: 23.9871, lng: 121.6015 },
  '台東縣': { lat: 22.7583, lng: 121.1444 },
  '澎湖縣': { lat: 23.5711, lng: 119.5793 },
  '金門縣': { lat: 24.4493, lng: 118.3766 },
  '連江縣': { lat: 26.1505, lng: 119.9499 },

  // 🇯🇵 日本主要都道府縣
  '愛知縣': { lat: 35.1802, lng: 136.9066 },
  '名古屋': { lat: 35.1815, lng: 136.9066 },
  '東京都': { lat: 35.6762, lng: 139.6503 },
  '東京': { lat: 35.6762, lng: 139.6503 },
  '大阪府': { lat: 34.6937, lng: 135.5023 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  '京都府': { lat: 35.0116, lng: 135.7681 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  '福岡縣': { lat: 33.5904, lng: 130.4017 },
  '福岡': { lat: 33.5904, lng: 130.4017 },
  '北海道': { lat: 43.0642, lng: 141.3469 },
  '神奈川縣': { lat: 35.4478, lng: 139.6425 },
  '沖繩縣': { lat: 26.2124, lng: 127.6809 },
  '兵庫縣': { lat: 34.6913, lng: 135.1830 },
  '廣島縣': { lat: 34.3853, lng: 132.4553 },
  '宮城縣': { lat: 38.2682, lng: 140.8694 },
  '靜岡縣': { lat: 34.9756, lng: 138.3828 },
  '奈良縣': { lat: 34.6851, lng: 135.8048 },
  '長野縣': { lat: 36.6513, lng: 138.1810 },
  '石川縣': { lat: 36.5947, lng: 136.6256 },
  '埼玉縣': { lat: 35.8617, lng: 139.6455 },
  '千葉縣': { lat: 35.6073, lng: 140.1063 },
  '熊本縣': { lat: 32.7898, lng: 130.7417 },
  '鹿兒島縣': { lat: 31.5966, lng: 130.5571 },

  // 🇰🇷 韓國
  '首爾': { lat: 37.5665, lng: 126.9780 },
  '釜山': { lat: 35.1796, lng: 129.0756 },
  '仁川': { lat: 37.4563, lng: 126.7052 },
  '大邱': { lat: 35.8714, lng: 128.6014 },
  '濟州島': { lat: 33.4996, lng: 126.5312 },

  // 🌏 國際
  '香港': { lat: 22.3193, lng: 114.1694 },
  '澳門': { lat: 22.1987, lng: 113.5439 },
  '曼谷': { lat: 13.7563, lng: 100.5018 },
  '新加坡': { lat: 1.3521, lng: 103.8198 },
  '紐約': { lat: 40.7128, lng: -74.0060 },
  '倫敦': { lat: 51.5074, lng: -0.1278 },
  '巴黎': { lat: 48.8566, lng: 2.3522 },
};

export function getCountryCodeByCity(city: string): string {
  for (const [code, info] of Object.entries(COUNTRIES_AND_REGIONS)) {
    if (info.cities.some(c => c.includes(city) || city.includes(c))) {
      return code;
    }
  }
  return 'TW';
}
