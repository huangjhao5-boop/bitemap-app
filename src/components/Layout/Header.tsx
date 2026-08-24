import React, { useRef } from 'react';
import type { Restaurant, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { 
  Plus, 
  Download, 
  Upload, 
  Flame, 
  RotateCw, 
  Play,
  Gift,
  Calculator,
} from 'lucide-react';

import { exportBackupData, importBackupData } from '../../utils/storage';

interface HeaderProps {
  restaurants: Restaurant[];
  lang: Language;
  profile: UserProfile;
  lastSyncTime?: string;
  onLanguageChange: (lang: Language) => void;
  onAddNewRestaurant: () => void;
  onOpenProfileModal: () => void;
  onOpenReelsModal: () => void;
  onOpenMysteryBox: () => void;
  onOpenBillSplitter: () => void;
  onOpenAuthModal: () => void;
  onDataChange: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  restaurants,
  lang,
  profile,
  lastSyncTime,
  onLanguageChange,
  onAddNewRestaurant,
  onOpenProfileModal,
  onOpenReelsModal,
  onOpenMysteryBox,
  onOpenBillSplitter,
  onOpenAuthModal,
  onDataChange,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mustEatCount = restaurants.filter((r) => r.ratingTag === 'must_eat').length;
  const totalVisits = restaurants.reduce((acc, r) => acc + (r.visitCount || 0), 0);

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

  
  return (
    <header className="sticky top-0 z-40 cute-glass border-b border-rose-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Cute Brand Logo & IG Gradient Name */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2.5px] shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[13px] flex items-center justify-center text-xl">
              🧋
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight ig-gradient-text m-0">
                {t.appName}
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xs">
                ✨ {t.appSubtitle}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold hidden md:block">
              {t.appDesc}
            </p>
          </div>
        </div>

        {/* Real-time stats summary badges (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-rose-50/80 px-3 py-1.5 rounded-2xl border border-rose-200/60 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-rose-900 font-bold">{t.mustEatSpots}:</span>
            <span className="font-black text-rose-600">{mustEatCount} {t.placesUnit}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-50/80 px-3 py-1.5 rounded-2xl border border-amber-200/60 shadow-2xs">
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-900 font-bold">{t.totalVisits}:</span>
            <span className="font-black text-amber-700">{totalVisits} {t.timesUnit}</span>
          </div>

          {/* Real-time Cloud Auto-Sync Indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold text-[11px]">
              {lang === 'zh-TW' ? `已同步 ${lastSyncTime || ''}` : `同期完了 ${lastSyncTime || ''}`}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Interactive Tools (Trendy IG Pills) */}
          <div className="flex items-center gap-1 bg-rose-50/60 p-1 rounded-2xl border border-rose-100">
            {/* Reels Feed Button */}
            <button
              onClick={onOpenReelsModal}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 hover:opacity-90 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 hover:scale-105"
              title={lang === 'zh-TW' ? '📱 沉浸式短影音流 (依最近距離排序)' : '📱 ショート動画フィード'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden lg:inline">{lang === 'zh-TW' ? '短影音流' : '動画'}</span>
            </button>

            {/* Mystery Box Button */}
            <button
              onClick={onOpenMysteryBox}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 hover:from-amber-400 hover:to-orange-500 text-amber-950 font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 hover:scale-105"
              title={lang === 'zh-TW' ? '🎁 美食盲盒抽籤機' : '🎁 ミステリーボックス'}
            >
              <Gift className="w-3.5 h-3.5 text-amber-900" />
              <span className="hidden lg:inline">{lang === 'zh-TW' ? '美食盲盒' : '盲盒'}</span>
            </button>

            {/* Bill Splitter Button */}
            <button
              onClick={onOpenBillSplitter}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 hover:scale-105"
              title={lang === 'zh-TW' ? '🎲 聚餐分帳與買單轉盤' : '🎲 割り勘＆おごり'}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{lang === 'zh-TW' ? '聚餐分帳' : '割り勘'}</span>
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === 'zh-TW' ? 'ja' : 'zh-TW')}
            className="px-2.5 py-1.5 rounded-2xl bg-white hover:bg-rose-50 text-slate-700 font-extrabold text-xs border border-rose-200/80 shadow-2xs transition-colors"
            title="切換語言 / 言語切替"
          >
            {lang === 'zh-TW' ? '🇯🇵 日' : '🇹🇼 中'}
          </button>

          {/* Account Login / Switch Button */}
          <button
            onClick={onOpenAuthModal}
            className="px-2.5 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-black text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
            title="登入、註冊或切換吃貨帳號"
          >
            <span>🔑</span>
            <span className="font-mono text-[11px]">{profile.foodieId || '登入'}</span>
          </button>

          {/* User Profile Button with IG Story Gradient Ring! */}
          <button
            onClick={onOpenProfileModal}

            className="p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-white hover:bg-pink-50 text-slate-800 border border-pink-200/80 font-bold text-xs flex items-center gap-1.5 shadow-2xs group transition-all"
            title={lang === 'zh-TW' ? '個人檔案與帳號設定' : 'プロフィール設定'}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.8px] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm overflow-hidden">
                {profile.avatar?.startsWith('data:') || profile.avatar?.startsWith('http') ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  profile.avatar
                )}
              </div>
            </div>
            <span className="hidden md:inline font-black text-slate-800">{profile.name}</span>
          </button>

          {/* Backup & Sync Controls */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={handleExport}
              title={t.exportBackup}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-rose-50 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title={t.importBackup}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-rose-50 transition-colors"
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
          </div>

          {/* Add Restaurant Button (Cute Floating Button) */}
          <button
            onClick={onAddNewRestaurant}
            className="px-3 py-2 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-black text-xs shadow-md shadow-pink-500/25 transition-all active:scale-95 hover:scale-105 flex items-center gap-1.5 shrink-0"
            title={t.addNewSpot}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">{t.addNewSpot} ✨</span>
          </button>
        </div>
      </div>
    </header>
  );
};
