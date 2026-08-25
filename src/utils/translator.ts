// 🍜 Smart Food & Review Bilingual Translator (ZH-TW <-> JA)
// Specialized dictionary for authentic Taiwanese & Japanese dishes, tastes, and review notes.

const FOOD_DICTIONARY_ZH_TO_JA: Record<string, string> = {
  // Dishes & Types
  '日式拉麵': 'ラーメン',
  '拉麵': 'ラーメン',
  '辛豚骨拉麵': '辛豚骨ラーメン',
  '豚骨拉麵': '豚骨ラーメン',
  '濃厚干貝沾麵': '濃厚ホタテつけ麺',
  '沾麵': 'つけ麺',
  '叉燒': 'チャーシュー',
  '厚切叉燒': '厚切りチャーシュー',
  '特製叉燒拼盤': '特製チャーシュー盛り合わせ',
  '黃金雞湯拉麵': '黄金鶏白湯ラーメン',
  '雞湯': '鶏ガラスープ',
  '和牛燒肉': '和牛焼肉',
  '燒肉': '焼肉',
  '居酒屋': '居酒屋',
  '牛舌': '牛タン',
  '頂級薄切蔥鹽牛舌': '極上ネギ塩牛タン (薄切り)',
  '蔥鹽牛舌': 'ネギ塩牛タン',
  '和牛扇子肉': '和牛ミスジ・ササミ',
  '松露干貝漢堡': 'トリュフホタテバーガー',
  '明太子烤飯糰': '明太子焼きおにぎり',
  '烤飯糰': '焼きおにぎり',
  '牛五花': '牛カルビ',
  '手沖咖啡': 'ハンドドリップコーヒー',
  '咖啡': 'コーヒー',
  '巴斯克乳酪': 'バスクチーズケーキ',
  '巴斯克乳酪蛋糕': 'バスクチーズケーキ',
  '肉桂捲': 'シナモンロール',
  '甜點': 'スイーツ・デザート',
  '小籠包': '小籠包 (ショウロンポウ)',
  '滷肉飯': 'ルーロー飯 (豚肉煮込みご飯)',
  '牛肉麵': '台湾牛肉麺',
  '麻辣鍋': '麻辣火鍋 (マーラー火鍋)',
  '麻辣火鍋': '麻辣火鍋',
  '火鍋': '鍋料理・しゃぶしゃぶ',
  '生魚片': '刺身 (お造り)',
  '壽司': '寿司',
  '韓式炸雞': 'ヤンニョムチキン・韓国チキン',
  '美式漢堡': 'アメリカンハンバーガー',
  '漢堡': 'ハンバーガー',
  '早午餐': 'ブランチ・カフェご飯',
  '焦糖布丁': '自家製プリン (カラメル)',
  '抹茶聖代': '抹茶パフェ',
  '生吐司': '生食パン',
  '定食': '定食',
  '精釀啤酒': 'クラフトビール',
  '水牛城辣雞翅': 'バッファローウィング',
  '牛排': 'ステーキ',
  '沙拉': 'サラダ',
  '芒果冰': '台湾マンゴーかき氷',
  '珍珠奶茶': 'タピオカミルクティー',
  '豆花': '豆花 (トウファ)',
  '胡椒餅': '胡椒餅 (フージャオビン)',
  '鹽酥雞': '台湾風から揚げ (イエンスージー)',
  '大腸包小腸': '台湾ソーセージもち米包み',

  // Tastes, Styles, and Preferences
  '硬麵': '麺硬め',
  '濃湯': '味濃いめ',
  '清淡': 'あっさり味',
  '太油膩': '油っぽすぎる',
  '少油低卡': 'ヘルシー・低カロリー',
  '不吃香菜': 'パクチー抜き',
  '香菜': 'パクチー',
  '怕辣': '辛いもの苦手',
  '微辣': 'ピリ辛',
  '中辣': '中辛',
  '大辣': '激辛',
  '不吃牛': '牛肉NG',
  '不吃羊': '羊肉NG',
  '不吃生食': '生ものNG',
  '討厭內臟': 'ホルモン・内臓系NG',
  '乳糖不耐': '乳糖不耐症',

  // Review Phrases
  '平日晚上排隊約 30 分鐘': '平日の夜は約30分並びます',
  '建議開店前 15 分鐘到': '開店15分前の到着がおすすめ',
  '建議開店前到': '開店前の到着推奨',
  '免排隊': '並ばずに入店可能',
  '排隊神店': '大行列の人気名店',
  '沾麵醬汁超級濃郁': 'つけ麺のタレが超濃厚！',
  '加麵免費一次': '替え玉1回無料サービスあり',
  '自己烤有半價優惠': 'セルフ焼きで50%OFF割引あり',
  '松露醬跟鹽昆布無限取用': 'トリュフソースと塩昆布が食べ放題でお得',
  '非常適合跟朋友聚會': '友人との飲み会・食事会に最適',
  '大推': '超おすすめ！',
  '必吃': '絶対食べるべき！',
  '環境極差': '衛生状態・店内の雰囲気が悪い',
  '態度惡劣': '店員の接客態度が悪い',
  '全面踩雷': '全体的にハズレ・おすすめしない',
};

// In-Memory Translation Cache
const translationCache: Record<string, string> = {};

export async function translateFoodText(
  text: string,
  targetLang: 'ja' | 'zh-TW'
): Promise<string> {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();

  // 1. Check local memory cache
  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // 2. Check localized dictionary
  if (targetLang === 'ja' && FOOD_DICTIONARY_ZH_TO_JA[trimmed]) {
    const result = FOOD_DICTIONARY_ZH_TO_JA[trimmed];
    translationCache[cacheKey] = result;
    return result;
  }

  // 3. Smart phrase substring replacement using dictionary
  if (targetLang === 'ja') {
    let replaced = trimmed;
    for (const [zh, ja] of Object.entries(FOOD_DICTIONARY_ZH_TO_JA)) {
      if (replaced.includes(zh)) {
        replaced = replaced.split(zh).join(ja);
      }
    }
    if (replaced !== trimmed) {
      translationCache[cacheKey] = replaced;
      return replaced;
    }
  }

  // 4. Fallback to free public translation endpoint (MyMemory Translation API)
  try {
    const fromLang = targetLang === 'ja' ? 'zh-TW' : 'ja';
    const toLang = targetLang === 'ja' ? 'ja' : 'zh-TW';
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        trimmed
      )}&langpair=${fromLang}|${toLang}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        translationCache[cacheKey] = translated;
        return translated;
      }
    }
  } catch (err) {
    console.log('Online translation fallback unavailable', err);
  }

  // Fallback to original text if offline
  return trimmed;
}
