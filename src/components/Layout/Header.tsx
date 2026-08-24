import React, { useRef } from 'react';
import type { Restaurant, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  Flame, 
  RotateCw, 
  AlertOctagon,
  Database,
  Play,
  Gift,
  Calculator
} from 'lucide-react';
import { exportBackupData, importBackupData, INITIAL_RESTAURANTS, INITIAL_FRIENDS, saveRestaurants, saveFriends } from '../../utils/storage';

interface HeaderProps {
  restaurants: Restaurant[];
  lang: Language;
  profile: UserProfile;
  lastSyncTime?: string;
  onLanguageChange: (lang: Language) => void;
  onAddNewRestaurant: () => void;
  onOpenSyncModal: () => void;
  onOpenProfileModal: () => void;
  onOpenReelsModal: () => void;
  onOpenMysteryBox: () => void;
  onOpenBillSplitter: () => void;
  onDataChange: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  restaurants,
  lang,
  profile,
  lastSyncTime,
  onLanguageChange,
  onAddNewRestaurant,
  onOpenSyncModal,
  onOpenProfileModal,
  onOpenReelsModal,
  onOpenMysteryBox,
  onOpenBillSplitter,
  onDataChange,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const mustEatCount = restaurants.filter((r) => r.ratingTag === 'must_eat').length;
  const totalVisits = restaurants.reduce((acc, r) => acc + (r.visitCount || 0), 0);
  const avoidCount = restaurants.filter((r) => r.ratingTag === 'avoid_again').length;

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
        onDataChange();
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    const msg = lang === 'zh-TW' 
      ? '確定要還原為預設示範資料嗎？這將會載入熱門短影音美食清單。' 
      : 'デモデータを復元しますか？人気のショート動画グルメリストが読み込まれます。';
    if (confirm(msg)) {
      saveRestaurants(INITIAL_RESTAURANTS);
      saveFriends(INITIAL_FRIENDS);
      onDataChange();
    }
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-lg sm:text-xl shadow-md shadow-rose-500/20">
            🥢
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white m-0">
                {t.appName}
              </h1>
              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-500 text-white uppercase">
                {t.appSubtitle}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              {t.appDesc}
            </p>
          </div>
        </div>

        {/* Real-time stats summary badges (Desktop Only) */}
        <div className="hidden xl:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-slate-300">{t.mustEatSpots}:</span>
            <span className="font-extrabold text-white">{mustEatCount} {t.placesUnit}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">{t.totalVisits}:</span>
            <span className="font-extrabold text-emerald-400">{totalVisits} {t.timesUnit}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-300">{t.honestAvoids}:</span>
            <span className="font-extrabold text-rose-400">{avoidCount} {t.placesUnit}</span>
          </div>

          {/* Real-time Cloud Auto-Sync Indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-[11px]">
              {lang === 'zh-TW' ? `雲端已同步 ${lastSyncTime || ''}` : `同期完了 ${lastSyncTime || ''}`}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Interactive Tools (Icons on Mobile, text on Desktop) */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            {/* Reels Feed Button */}
            <button
              onClick={onOpenReelsModal}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
              title={lang === 'zh-TW' ? '📱 沉浸式短影音流 (依最近距離排序)' : '📱 ショート動画フィード'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden lg:inline">{lang === 'zh-TW' ? '短影音流' : '動画'}</span>
            </button>

            {/* Mystery Box Button */}
            <button
              onClick={onOpenMysteryBox}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
              title={lang === 'zh-TW' ? '🎁 美食盲盒抽籤機' : '🎁 ミステリーボックス'}
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{lang === 'zh-TW' ? '美食盲盒' : '盲盒'}</span>
            </button>

            {/* Bill Splitter Button */}
            <button
              onClick={onOpenBillSplitter}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
              title={lang === 'zh-TW' ? '🎲 聚餐分帳與買單轉盤' : '🎲 割り勘＆おごり'}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{lang === 'zh-TW' ? '聚餐分帳' : '割り勘'}</span>
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === 'zh-TW' ? 'ja' : 'zh-TW')}
            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
            title="切換語言 / 言語切替"
          >
            {lang === 'zh-TW' ? '🇯🇵 日' : '🇹🇼 中'}
          </button>

          {/* User Profile Settings Button */}
          <button
            onClick={onOpenProfileModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs group"
            title={lang === 'zh-TW' ? '個人檔案與帳號設定' : 'プロフィール設定'}
          >
            <span className="text-base group-hover:scale-110 transition-transform">{profile.avatar}</span>
            <span className="hidden md:inline font-bold text-slate-200">{profile.name}</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs hidden sm:flex"
            title={t.dataBindingTitle}
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Backup dropdown / controls (Hidden on small screens) */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={handleExport}
              title={t.exportBackup}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title={t.importBackup}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={handleResetDefault}
              title={t.resetDemo}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Add Restaurant Button */}
          <button
            onClick={onAddNewRestaurant}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-1 shrink-0"
            title={t.addNewSpot}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.addNewSpot}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
