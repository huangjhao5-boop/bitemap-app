import React, { useState, useRef } from 'react';
import type { Restaurant, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  X, 
  Copy, 
  Check, 
  MapPin, 
  Star, 
  Navigation, 
  Video,
  Download,
  Camera,
  Sparkles,
  Flame
} from 'lucide-react';

import { toPng } from 'html-to-image';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  lang: Language;
  userProfile?: UserProfile;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  lang,
  userProfile,
}) => {
  const t = translations[lang];
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !restaurant) return null;

  const googleMapsSearchUrl =
    restaurant.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurant.name + ' ' + restaurant.address
    )}`;

  const videoSource = restaurant.videos && restaurant.videos.length > 0 ? restaurant.videos[0] : null;

  const generateShareText = () => {
    let text = `🥢 【${lang === 'zh-TW' ? '美食推薦' : 'おすすめグルメ'}】${restaurant.name} (${restaurant.category})
`;
    text += `📍 ${lang === 'zh-TW' ? '地址' : '住所'}：${restaurant.address}
`;
    text += `🗺️ Google Maps：${googleMapsSearchUrl}
`;
    
    if (restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0) {
      text += `🌟 ${lang === 'zh-TW' ? '必吃推薦' : '必食名物'}：${restaurant.mustEatDishes.join('、')}
`;
    }
    
    if (restaurant.avoidDishes && restaurant.avoidDishes.length > 0) {
      text += `⚠️ ${lang === 'zh-TW' ? '避雷勿點' : 'リピなし注意'}：${restaurant.avoidDishes.join('、')}
`;
    }

    if (restaurant.personalNotes) {
      text += `💬 ${lang === 'zh-TW' ? '私房筆記' : '個人メモ'}：${restaurant.personalNotes}
`;
    }

    if (videoSource) {
      text += `🎬 ${lang === 'zh-TW' ? '短影音介紹' : 'SNS動画'}：${videoSource.url}
`;
    }

    const signature = userProfile ? `
✨ 由 @${userProfile.name} 推薦` : '';
    text += `${signature}
— ${lang === 'zh-TW' ? '來自 BiteMap 短影音美食地圖' : 'BiteMap ショート動画マップより'}`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadCardImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsGeneratingImg(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `BiteMap_${restaurant.name.replace(/\s+/g, '_')}_card.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export image', err);
      alert('產生圖片時發生問題，請稍候重試！');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-bold text-white">
              {lang === 'zh-TW' ? 'IG 美食分享小卡 & 文案生成' : 'IG シェアカード＆テキスト作成'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Visual IG Card for Download / Sharing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{lang === 'zh-TW' ? '📸 IG 限時動態精美小卡預覽：' : '📸 IG ストーリー用カードプレビュー：'}</span>
              </span>
              <button
                onClick={handleDownloadCardImage}
                disabled={isGeneratingImg}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{lang === 'zh-TW' ? '小卡已成功下載！' : 'ダウンロード完了！'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGeneratingImg ? (lang === 'zh-TW' ? '生成小卡中...' : '生成中...') : (lang === 'zh-TW' ? '📥 下載 IG 分享小卡圖片' : '📥 画像として保存')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Target DOM Element for HTML-to-Image */}
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700 space-y-4"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Top Banner with App Brand & User Signature */}
              <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-sm">
                    🥢
                  </div>
                  <span className="font-black text-sm tracking-tight text-white">BiteMap</span>
                </div>

                {userProfile && (
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-200">
                    <span>{userProfile.avatar}</span>
                    <span>@{userProfile.name}</span>
                  </div>
                )}
              </div>

              {/* Restaurant Picture & Title */}
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-xs flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    {t.tagMustEat}
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {restaurant.category} · {restaurant.priceRange}
                  </span>
                </div>

                {restaurant.coverImage && (
                  <div className="w-full h-40 rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-black text-white leading-tight">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{restaurant.city} · {restaurant.address}</span>
                  </p>
                </div>
              </div>

              {/* Must Eat Dishes in Card */}
              {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs space-y-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{t.mustEatDishesTitle}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {restaurant.mustEatDishes.map((dish, i) => (
                      <span key={i} className="bg-white/20 px-2.5 py-1 rounded-lg text-white font-semibold text-xs">
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Video Tag & Footer */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                {videoSource ? (
                  <div className="flex items-center gap-1 text-pink-300">
                    <Video className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">短影音：{videoSource.title || videoSource.url}</span>
                  </div>
                ) : (
                  <span>Google Maps 官方推薦景點</span>
                )}
                <span className="font-mono text-[10px] text-slate-400">#BiteMap #美食短影音</span>
              </div>
            </div>
          </div>

          {/* Formatted Text Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{t.shareTextPreview}</span>
            </div>
            <pre className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
              {generateShareText()}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t.testGoogleMaps}</span>
          </a>

          <button
            onClick={handleCopyText}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1.5"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{t.copiedSuccess}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.btnCopyText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
