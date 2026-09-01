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
}

// 🍜 Guess category from name and amenity
function guessCategory(name: string, amenity: string = ''): string {
  const text = (name + ' ' + amenity).toLowerCase();
  if (text.includes('拉麵') || text.includes('麵') || text.includes('ramen') || text.includes('udon') || text.includes('蕎麥')) return '日式拉麵';
  if (text.includes('燒肉') || text.includes('牛排') || text.includes('肉') || text.includes('bbq') || text.includes('steak') || text.includes('串燒')) return '和牛燒肉';
  if (text.includes('火鍋') || text.includes('鍋') || text.includes('麻辣') || text.includes('hotpot') || text.includes('しゃぶ')) return '火鍋鍋物';
  if (text.includes('日料') || text.includes('壽司') || text.includes('sushi') || text.includes('生魚片') || text.includes('居酒屋') || text.includes('海鮮')) return '日式料理';
  if (text.includes('咖啡') || text.includes('早午餐') || text.includes('cafe') || text.includes('coffee') || text.includes('brunch')) return '咖啡早午餐';
  if (text.includes('甜點') || text.includes('蛋糕') || text.includes('冰') || text.includes('dessert') || text.includes('bakery') || text.includes('麵包') || text.includes('豆花') || text.includes('刨冰')) return '甜點午茶';
  if (text.includes('披薩') || text.includes('義式') || text.includes('pizza') || text.includes('義大利麵') || text.includes('pasta')) return '義式料理';
  if (text.includes('漢堡') || text.includes('美式') || text.includes('burger') || text.includes('薯條')) return '美式漢堡';
  if (text.includes('酒吧') || text.includes('酒') || text.includes('bar') || text.includes('bistro') || text.includes('餐酒館')) return '微醺酒吧';
  if (text.includes('牛肉麵') || text.includes('小吃') || text.includes('便當') || text.includes('滷肉飯') || text.includes('夜市') || text.includes('水餃') || text.includes('熱炒')) return '台灣道地小吃';
  if (text.includes('泰式') || text.includes('越式') || text.includes('韓式') || text.includes('港式') || text.includes('飲茶')) return '異國異風美食';
  return '精選美食';
}

// 🏙️ Detect city from address or raw text
function detectCity(addrObj: any, fullDisplayName: string): string {
  const text = (fullDisplayName + ' ' + (addrObj?.city || '') + ' ' + (addrObj?.county || '') + ' ' + (addrObj?.state || '')).replace('臺', '台');
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

// 🔍 Search Places Online via High-Speed POI Geocoding
export async function searchGooglePlacesOnline(query: string): Promise<PlaceSearchResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(cleanQ)}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'zh-TW,zh;q=0.9,ja;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any, idx: number) => {
      const rawName = item.name || (item.display_name ? item.display_name.split(',')[0] : cleanQ);
      const cleanName = rawName.trim();
      const city = detectCity(item.address, item.display_name || '');
      
      // Clean readable address
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
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${gMapsQuery}`;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${cleanName} ${city} 美食 評價`)}`;

      return {
        id: `poi_${Date.now()}_${idx}`,
        name: cleanName,
        category,
        city,
        address: formattedAddress || `${city} (查無詳細門牌)`,
        lat,
        lng,
        googleMapsUrl,
        googleSearchUrl,
        priceRange: category.includes('燒肉') || category.includes('牛排') ? '$$$' : category.includes('早午餐') || category.includes('火鍋') ? '$$' : '$',
        rawType: item.type,
      };
    });
  } catch (err) {
    console.error('Place search error', err);
    return [];
  }
}
