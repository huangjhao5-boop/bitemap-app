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
  Flame,
  Share2,
  Send,
  ExternalLink,
  Play
} from 'lucide-react';


import { toPng } from 'html-to-image';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  lang: Language;
  userProfile?: UserProfile;
}

function normalizeUrl(url?: string): string {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
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
  const [copiedMapUrl, setCopiedMapUrl] = useState(false);
  const [copiedVideoUrl, setCopiedVideoUrl] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !restaurant) return null;

  const rawMapUrl =
    restaurant.googleMapsUrl && restaurant.googleMapsUrl.startsWith('http')
      ? restaurant.googleMapsUrl.trim()
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          restaurant.name + ' ' + (restaurant.address || restaurant.city)
        )}`;
  const googleMapsSearchUrl = normalizeUrl(rawMapUrl);

  const videoSource = restaurant.videos && restaurant.videos.length > 0 ? restaurant.videos[0] : null;
  const normalizedVideoUrl = videoSource ? normalizeUrl(videoSource.url) : '';

  // 📝 Generate Clean Clickable Format for LINE / WhatsApp / Messages (URLs MUST be on their own line with whitespace)
  const generateShareText = () => {
    let text = `🥢 【${lang === 'zh-TW' ? '美食好店推薦' : 'おすすめグルメ'}】${restaurant.name} (${restaurant.category})

`;
    
    text += `📍 ${lang === 'zh-TW' ? '店家地址' : '住所'}：${restaurant.address}

`;
    
    // Google Maps Link (Isolated on its own line for 100% LINE clickability!)
    text += `🗺️ ${lang === 'zh-TW' ? 'Google Maps 導航連結（點擊直接開地圖）：' : 'Google Maps ナビ（タップで開く）：'}
`;
    text += `${googleMapsSearchUrl}

`;
    
    if (restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0) {
      text += `🌟 ${lang === 'zh-TW' ? '必吃招牌推薦' : '必食名物'}：${restaurant.mustEatDishes.join('、')}

`;
    }
    
    if (restaurant.avoidDishes && restaurant.avoidDishes.length > 0) {
      text += `⚠️ ${lang === 'zh-TW' ? '避雷提醒勿點' : 'リピなし注意'}：${restaurant.avoidDishes.join('、')}

`;
    }

    if (restaurant.personalNotes) {
      text += `💬 ${lang === 'zh-TW' ? '私房真實評價' : '個人メモ'}：${restaurant.personalNotes}

`;
    }

    // Video Link (Isolated on its own line for LINE rich preview & clickability!)
    if (normalizedVideoUrl) {
      text += `🎬 ${lang === 'zh-TW' ? '短影音介紹（點擊直接看影片）：' : '紹介動画（タップで再生）：'}
`;
      text += `${normalizedVideoUrl}

`;
    }

    const signature = userProfile ? `✨ 由 @${userProfile.name} 推薦
` : '';
    text += `${signature}— ${lang === 'zh-TW' ? '來自 BiteMap 短影音美食地圖' : 'BiteMap ショート動画マップより'}`;
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

  const handleCopyMapUrl = async () => {
    try {
      await navigator.clipboard.writeText(googleMapsSearchUrl);
      setCopiedMapUrl(true);
      setTimeout(() => setCopiedMapUrl(false), 2500);
    } catch (err) {
      console.error('Failed to copy map url', err);
    }
  };

  const handleCopyVideoUrl = async () => {
    if (!normalizedVideoUrl) return;
    try {
      await navigator.clipboard.writeText(normalizedVideoUrl);
      setCopiedVideoUrl(true);
      setTimeout(() => setCopiedVideoUrl(false), 2500);
    } catch (err) {
      console.error('Failed to copy video url', err);
    }
  };

  // 📲 Native Mobile Web Share (Direct to Instagram Stories, Instagram App, LINE, Messages)
  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsSharingNative(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `BiteMap_${restaurant.name}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `BiteMap 美食推薦：${restaurant.name}`,
          text: generateShareText(),
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `BiteMap 美食推薦：${restaurant.name}`,
          text: generateShareText(),
          url: googleMapsSearchUrl,
        });
      } else {
        await handleCopyText();
        handleDownloadCardImage();
      }
    } catch (err) {
      console.log('Share canceled or not supported', err);
    } finally {
      setIsSharingNative(false);
    }
  };

  // 💬 LINE Direct One-Click Share Link
  const handleLineShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
  };

  // 📸 Direct Jump to Instagram App
  const handleOpenInstagram = async () => {
    await handleCopyText();
    window.location.href = 'instagram://story-camera';
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank');
    }, 1500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-400" />
            <h2 className="text-sm sm:text-base font-black text-white">
              {lang === 'zh-TW' ? '📸 美食小卡 & 社群一鍵直傳' : '📸 シェアカード＆SNS送信'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Quick Action Share Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* 🚀 Mobile Native Share (Insta / Stories / AirDrop) */}
            <button
              onClick={handleNativeShare}
              disabled={isSharingNative}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSharingNative ? '處理中...' : (lang === 'zh-TW' ? '🚀 一鍵直傳 IG/限動' : '🚀 IGストーリー共有')}</span>
            </button>

            {/* 💬 LINE One-Click Direct Message */}
            <button
              onClick={handleLineShare}
              className="p-2.5 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'zh-TW' ? '💬 LINE 一鍵傳送' : '💬 LINEで送る'}</span>
            </button>

            {/* 📥 Download PNG Card */}
            <button
              onClick={handleDownloadCardImage}
              disabled={isGeneratingImg}
              className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 border border-slate-200 active:scale-95 transition-all"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>已存小卡！</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>{isGeneratingImg ? '下載中...' : (lang === 'zh-TW' ? '📥 下載圖片' : '📥 画像保存')}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Direct Link Tappers (For fast copy or direct open) */}
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'zh-TW' ? '🗺️ 開啟 Google Maps' : '🗺️ Google Maps を開く'}</span>
              <ExternalLink className="w-3 h-3 text-blue-500" />
            </a>

            <button
              onClick={handleCopyMapUrl}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              {copiedMapUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMapUrl ? '已複製地圖網址' : '複製地圖網址'}</span>
            </button>

            {normalizedVideoUrl && (
              <a
                href={normalizedVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-pink-600 fill-current" />
                <span>{lang === 'zh-TW' ? '🎬 直接觀看短影音' : '🎬 動画を再生'}</span>
                <ExternalLink className="w-3 h-3 text-pink-500" />
              </a>
            )}

            {normalizedVideoUrl && (
              <button
                onClick={handleCopyVideoUrl}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                {copiedVideoUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVideoUrl ? '已複製影片網址' : '複製影片網址'}</span>
              </button>
            )}
          </div>

          {/* Visual Aesthetic Card Preview */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-800 block">
              {lang === 'zh-TW' ? '📸 小卡預覽效果：' : '📸 カードプレビュー：'}
            </span>

            {/* Target DOM Element for HTML-to-Image */}
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700 space-y-3.5"
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Top Banner with App Brand & User Signature */}
              <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-xs">
                    🥢
                  </div>
                  <span className="font-black text-xs tracking-tight text-white">BiteMap</span>
                </div>

                {userProfile && (
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-200">
                    <span>{userProfile.avatar}</span>
                    <span>@{userProfile.name}</span>
                  </div>
                )}
              </div>

              {/* Restaurant Picture & Title */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current text-slate-950" />
                    {t.tagMustEat}
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {restaurant.category} · {restaurant.priceRange}
                  </span>
                </div>

                {restaurant.coverImage && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{restaurant.city} · {restaurant.address}</span>
                  </p>
                </div>
              </div>

              {/* Must Eat Dishes in Card */}
              {restaurant.mustEatDishes && restaurant.mustEatDishes.length > 0 && (
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>{t.mustEatDishesTitle}</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {restaurant.mustEatDishes.map((dish, i) => (
                      <span key={i} className="bg-white/20 px-2 py-0.5 rounded-lg text-white font-semibold text-[11px]">
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Video Tag & Footer */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                {videoSource ? (
                  <div className="flex items-center gap-1 text-pink-300">
                    <Video className="w-3 h-3" />
                    <span className="truncate max-w-[180px]">短影音：{videoSource.title || videoSource.url}</span>
                  </div>
                ) : (
                  <span>Google Maps 推薦美食</span>
                )}
                <span className="font-mono text-[9px] text-slate-400">#BiteMap #美食小卡</span>
              </div>
            </div>
          </div>

          {/* Formatted Text Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{t.shareTextPreview}</span>
              <button
                onClick={handleCopyText}
                className="text-xs text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? t.copiedSuccess : t.btnCopyText}</span>
              </button>
            </div>
            <pre className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-36 overflow-y-auto">
              {generateShareText()}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleOpenInstagram}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>開啟 Instagram</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t.copiedSuccess}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.btnCopyText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
