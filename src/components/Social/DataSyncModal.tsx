import React, { useState, useRef } from 'react';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  X, 
  Download, 
  Upload, 
  Check, 
  Database, 
  HardDrive,
  Copy,
  Lock,
  Gift,
  AlertCircle
} from 'lucide-react';
import { exportBackupData, importBackupData, loadRestaurants } from '../../utils/storage';
import { signInWithGoogle, syncDataToCloud, fetchUserDataFromCloud } from '../../utils/firebase';
import type { UserProfile, Restaurant, Friend, DiningMeetup, FriendRequest } from '../../types';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onDataImported: () => void;
  userProfile?: UserProfile;
  restaurants?: Restaurant[];
  friends?: Friend[];
  meetups?: DiningMeetup[];
  friendRequests?: FriendRequest[];
  onCloudRestored?: (data: { profile?: UserProfile; restaurants?: Restaurant[]; friends?: Friend[]; meetups?: DiningMeetup[] }) => void;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  lang,
  onDataImported,
  userProfile,
  restaurants = [],
  friends = [],
  meetups = [],
  friendRequests = [],
  onCloudRestored,
}) => {
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedPrivateUrl, setCopiedPrivateUrl] = useState(false);
  const [copiedPublicUrl, setCopiedPublicUrl] = useState(false);


  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportBackupData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitemap_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupData(content);
      alert(res.message);
      if (res.success) {
        onDataImported();
        onClose();
      }
    };
    reader.readAsText(file);
  };

  // 1. Private Full Sync (For your own devices: includes personal logs & friends list)
  const generatePrivateSyncUrl = () => {
    const rawData = exportBackupData();
    try {
      const encoded = btoa(encodeURIComponent(rawData));
      return `${window.location.origin}${window.location.pathname}#sync=${encoded}`;
    } catch {
      return window.location.href;
    }
  };

  // 2. Friend-Safe Public Pack (For friends: ONLY exports public store info, videos, must-eats; STRIPS private notes & private friends data)
  const generatePublicSharePackUrl = () => {
    const restaurants = loadRestaurants();
    // Clean out personal/sensitive records: remove avoid_again, remove personal private notes, remove private friends IDs
    const publicSpots = restaurants
      .filter((r) => r.ratingTag !== 'avoid_again') // Don't share blacklisted personal items
      .map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        city: r.city,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        googleMapsUrl: r.googleMapsUrl,
        priceRange: r.priceRange,
        ratingTag: r.ratingTag,
        visitCount: 0, // Reset personal visit count
        mustEatDishes: r.mustEatDishes,
        avoidDishes: [], // Clean avoid notes
        personalNotes: '', // Clean private notes
        videos: r.videos,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

    const cleanPack = {
      version: '1.0',
      isPublicPack: true,
      exportedAt: new Date().toISOString(),
      restaurants: publicSpots,
      friends: [], // Keep friends directory private
    };

    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(cleanPack)));
      return `${window.location.origin}${window.location.pathname}#sync=${encoded}`;
    } catch {
      return window.location.href;
    }
  };

  const handleCopyPrivateUrl = async () => {
    try {
      const url = generatePrivateSyncUrl();
      await navigator.clipboard.writeText(url);
      setCopiedPrivateUrl(true);
      setTimeout(() => setCopiedPrivateUrl(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPublicUrl = async () => {
    try {
      const url = generatePublicSharePackUrl();
      await navigator.clipboard.writeText(url);
      setCopiedPublicUrl(true);
      setTimeout(() => setCopiedPublicUrl(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              {t.syncModalTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Privacy Note Alert */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {lang === 'zh-TW' ? '🔒 隱私與分享安全提示：' : '🔒 プライバシーと共有に関する注意：'}
              </span>
              <p>
                {lang === 'zh-TW'
                  ? '本系統嚴格區分「個人裝置同步（完整備份）」與「分享給好友（已脫敏口袋名單）」，請依據對象選擇對應方式！'
                  : '自分の端末用（完全同期）と友達シェア用（個人情報除去）を分離しています。用途に合わせてお選びください。'}
              </p>
            </div>
          </div>

          {/* Option A: Friend-Safe Public Pocket List (For friends) */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-emerald-950">
                    {lang === 'zh-TW' ? '🎁 分享給好友：「純美食推薦包」' : '🎁 友達にシェア：「グルメおすすめパック」'}
                  </h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    {lang === 'zh-TW' ? '安全保護' : '安全'}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  {lang === 'zh-TW'
                    ? '已自動移除您的私房筆記、造訪次數、避雷黑名單與朋友通訊錄，朋友只會看到餐廳、Google Maps 導航與短影音！'
                    : '個人のメモや訪問回数、友達リスト、地雷店舗を自動除去。純粋なおすすめ店・動画・Googleマップのみを共有します。'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyPublicUrl}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              {copiedPublicUrl ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>{lang === 'zh-TW' ? '已複製好友安全分享網址！' : '友達用安全URLをコピーしました！'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'zh-TW' ? '🔗 複製好友分享專用網址' : '🔗 友達用おすすめURLをコピー'}</span>
                </>
              )}
            </button>
          </div>

          {/* Option B: Private Device Sync (For your own phone/PC) */}
          <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-purple-950">
                    {lang === 'zh-TW' ? '📱 自己使用：「跨裝置完整同步網址」' : '📱 自分用：「完全端末同期URL」'}
                  </h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                    {lang === 'zh-TW' ? '限本人' : '自分限定'}
                  </span>
                </div>
                <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                  {lang === 'zh-TW'
                    ? '包含您個人的完整資料（含私房筆記、造訪次數、上次造訪日期與吃貨朋友口味手冊），適合傳給自己的手機開啟。'
                    : '個人の非公開メモや訪問回数、友達手帳を含む全データを同期。自分のスマホへの同期専用です。'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyPrivateUrl}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              {copiedPrivateUrl ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{t.urlCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'zh-TW' ? '🔗 複製本人專用同步網址 (傳給自己)' : '🔗 自分用完全同期URLをコピー'}</span>
                </>
              )}
            </button>
          </div>

          {/* Option C: JSON File Backup (Google Drive / iCloud) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {t.syncMethod1Title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {t.syncMethod1Desc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleExport}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>{t.btnExportFile}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>{t.btnImportFile}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {t.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
};
