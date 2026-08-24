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

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  '台北市': { lat: 25.0478, lng: 121.5319 },
  '新北市': { lat: 25.0118, lng: 121.4658 },
  '台中市': { lat: 24.1477, lng: 120.6736 },
  '台南市': { lat: 22.9997, lng: 120.2270 },
  '高雄市': { lat: 22.6273, lng: 120.3014 },
  '新竹市': { lat: 24.8138, lng: 120.9675 },
  '桃園市': { lat: 24.9936, lng: 121.3010 },
  '東京': { lat: 35.6762, lng: 139.6503 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  '福岡': { lat: 33.5904, lng: 130.4017 },
};
