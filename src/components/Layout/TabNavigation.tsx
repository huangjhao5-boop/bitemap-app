import React from 'react';
import type { ActiveTab } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  restaurantCount: number;
  friendCount: number;
  lang: Language;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  restaurantCount,
  friendCount,
  lang,
}) => {
  const t = translations[lang];

  const tabs: { id: ActiveTab; label: string; icon: string; count?: number }[] = [
    { id: 'map', label: t.tabMap, icon: '🗺️', count: restaurantCount },
    { id: 'list', label: t.tabList, icon: '📸', count: restaurantCount },
    { id: 'friends', label: t.tabFriends, icon: '👯', count: friendCount },
    { id: 'matcher', label: t.tabMatcher, icon: '✨' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
      <div className="flex bg-rose-100/50 p-1.5 rounded-3xl border border-rose-200/50 shadow-2xs gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-md shadow-pink-100 scale-100 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                    isActive ? 'bg-pink-100 text-pink-700' : 'bg-rose-200/50 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
