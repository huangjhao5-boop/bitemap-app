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
  source?: 'photon' | 'nominatim' | 'custom';
}

// 🍜 Guess category from name and amenity
export function guessCategory(name: string, amenity: string = ''): string {
  const text = (name + ' ' + amenity).toLowerCase();
  if (text.includes('拉麵') || text.includes('麵') || text.includes('ramen') || text.includes('udon') || text.includes('蕎麥')) return '日式拉麵';
  if (text.includes('燒肉') || text.includes('牛排') || text.includes('肉') || text.includes('bbq') || text.includes('steak') || text.includes('串燒') || text.includes('燒烤')) return '和牛燒肉';
  if (text.includes('火鍋') || text.includes('鍋') || text.includes('麻辣') || text.includes('hotpot') || text.includes('しゃぶ')) return '火鍋鍋物';
  if (text.includes('日料') || text.includes('壽司') || text.includes('sushi') || text.includes('生魚片') || text.includes('居酒屋') || text.includes('海鮮') || text.includes('丼飯')) return '日式料理';
  if (text.includes('咖啡') || text.includes('早午餐') || text.includes('cafe') || text.includes('coffee') || text.includes('brunch') || text.includes('tea')) return '咖啡早午餐';
  if (text.includes('甜點') || text.includes('蛋糕') || text.includes('冰') || text.includes('dessert') || text.includes('bakery') || text.includes('麵包') || text.includes('豆花') || text.includes('刨冰') || text.includes('舒芙蕾')) return '甜點午茶';
  if (text.includes('披薩') || text.includes('義式') || text.includes('pizza') || text.includes('義大利麵') || text.includes('pasta')) return '義式料理';
  if (text.includes('漢堡') || text.includes('美式') || text.includes('burger') || text.includes('薯條')) return '美式漢堡';
  if (text.includes('酒吧') || text.includes('酒') || text.includes('bar') || text.includes('bistro') || text.includes('餐酒館') || text.includes('pub')) return '微醺酒吧';
  if (text.includes('牛肉麵') || text.includes('小吃') || text.includes('便當') || text.includes('滷肉飯') || text.includes('夜市') || text.includes('水餃') || text.includes('熱炒') || text.includes('雞肉飯') || text.includes('肉圓')) return '台灣道地小吃';
  if (text.includes('泰式') || text.includes('越式') || text.includes('韓式') || text.includes('港式') || text.includes('飲茶') || text.includes('咖哩') || text.includes('curry')) return '異國美食';
  return '精選美食';
}

// 🏙️ Detect city from address or raw text
export function detectCity(addrText: string): string {
  const text = (addrText || '').replace(/臺/g, '台');
  if (text.includes('台北') || text.includes('Taipei')) return '台北市';
  if (text.includes('新北') || text.includes('New Taipei')) return '新北市';
  if (text.includes('台中') || text.includes('Taichung')) return '台中市';
  if (text.includes('台南') || text.includes('Tainan')) return '台南市';
  if (text.includes('高雄') || text.includes('Kaohsiung')) return '高雄市';
  if (text.includes('新竹') || text.includes('Hsinchu')) return '新竹市';
  if (text.includes('桃園') || text.includes('Taoyuan')) return '桃園市';
  if (text.includes('東京') || text.includes('Tokyo')) return '東京';
  if (text.includes('大阪') || text.includes('Osaka')) return '大阪';
  if (text.includes('京都') || text.includes('Kyoto')) return '京都';
  if (text.includes('福岡') || text.includes('Fukuoka')) return '福岡';
  return '台北市';
}

// 🔍 Search Places Online via Multi-Engine (Photon Fuzzy + Nominatim POI)
export async function searchGooglePlacesOnline(query: string): Promise<PlaceSearchResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 1) return [];

  const results: PlaceSearchResult[] = [];
  const seenKeys = new Set<string>();

  // Engine 1: Photon (Ultra-fast Elasticsearch POI search, best for branches and fuzzy names)
  const photonPromise = (async () => {
    try {
      const url = `https://photon.komoot.io/api/?lang=default&limit=15&q=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.features || !Array.isArray(data.features)) return [];

      return data.features.map((f: any, idx: number): PlaceSearchResult => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [121.5319, 25.0478];
        const lng = coords[0];
        const lat = coords[1];

        const rawName = props.name || cleanQ;
        const street = props.street || props.district || props.suburb || '';
        const cityCandidate = props.city || props.state || props.county || '';
        const city = detectCity(cityCandidate + ' ' + street + ' ' + (props.country || ''));

        let fullAddress = [city, props.district || props.suburb, street, props.housenumber ? props.housenumber + '號' : '']
          .filter(Boolean)
          .join('');

        if (!fullAddress || fullAddress === city) {
          fullAddress = `${city} ${street || props.name || ''}`.trim();
        }

        const category = guessCategory(rawName, props.osm_value || props.osm_key || '');
        const gMapsQuery = encodeURIComponent(`${rawName} ${fullAddress}`);

        return {
          id: `photon_${Date.now()}_${idx}`,
          name: rawName,
          category,
          city,
          address: fullAddress || `${city} (查無詳細門牌)`,
          lat,
          lng,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${gMapsQuery}`,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${rawName} ${city} 美食 評價`)}`,
          priceRange: category.includes('燒肉') || category.includes('牛排') ? '$$$' : category.includes('早午餐') || category.includes('火鍋') ? '$$' : '$',
          rawType: props.osm_value,
          source: 'photon',
        };
      });
    } catch (e) {
      console.warn('Photon search error', e);
      return [];
    }
  })();

  // Engine 2: Nominatim (Structured address search)
  const nominatimPromise = (async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'zh-TW,zh;q=0.9,ja;q=0.8,en;q=0.7' },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any, idx: number): PlaceSearchResult => {
        const rawName = item.name || (item.display_name ? item.display_name.split(',')[0] : cleanQ);
        const cleanName = rawName.trim();
        const city = detectCity((item.display_name || '') + ' ' + (item.address?.city || '') + ' ' + (item.address?.state || ''));

        let formattedAddress = item.display_name || '';
        if (item.address) {
          const road = item.address.road || '';
          const house = item.address.house_number ? item.address.house_number + '號' : '';
          const suburb = item.address.suburb || item.address.neighbourhood || '';
          if (road) {
            formattedAddress = `${city}${suburb}${road}${house}`;
          }
        }

        const lat = parseFloat(item.lat) || 25.0478;
        const lng = parseFloat(item.lon) || 121.5319;
        const category = guessCategory(cleanName, item.type || '');
        const gMapsQuery = encodeURIComponent(`${cleanName} ${formattedAddress}`);

        return {
          id: `nom_${Date.now()}_${idx}`,
          name: cleanName,
          category,
          city,
          address: formattedAddress || `${city} (查無詳細門牌)`,
          lat,
          lng,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${gMapsQuery}`,
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${cleanName} ${city} 美食 評價`)}`,
          priceRange: category.includes('燒肉') || category.includes('牛排') ? '$$$' : category.includes('早午餐') || category.includes('火鍋') ? '$$' : '$',
          rawType: item.type,
          source: 'nominatim',
        };
      });
    } catch (e) {
      console.warn('Nominatim search error', e);
      return [];
    }
  })();

  const [photonRes, nominatimRes] = await Promise.all([photonPromise, nominatimPromise]);

  // Merge and deduplicate by clean name + city
  [...photonRes, ...nominatimRes].forEach((item) => {
    const key = (item.name + '_' + item.city).toLowerCase().replace(/\s/g, '');
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      results.push(item);
    }
  });

  return results;
}
