import React from 'react';
import type { ActiveTab } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { Map, ListFilter, Users, Dices } from 'lucide-react';

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

  const tabs = [
    {
      id: 'map' as ActiveTab,
      label: t.tabMap,
      icon: Map,
      badge: `${restaurantCount} ${t.placesUnit}`,
    },
    {
      id: 'list' as ActiveTab,
      label: t.tabList,
      icon: ListFilter,
      badge: `${restaurantCount} ${t.placesUnit}`,
    },
    {
      id: 'friends' as ActiveTab,
      label: t.tabFriends,
      icon: Users,
      badge: `${friendCount} ${t.peopleUnit}`,
    },
    {
      id: 'matcher' as ActiveTab,
      label: t.tabMatcher,
      icon: Dices,
      badge: t.avoidSmart,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex gap-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
