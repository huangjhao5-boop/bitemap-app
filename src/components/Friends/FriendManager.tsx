import React, { useState } from 'react';
import type { Friend, Restaurant } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { FriendTasteModal } from './FriendTasteModal';
import { 
  UserPlus, 
  Heart, 
  AlertOctagon, 
  Edit2, 
  Trash2, 
  UtensilsCrossed, 
  Search
} from 'lucide-react';

interface FriendManagerProps {
  friends: Friend[];
  restaurants: Restaurant[];
  lang: Language;
  onSaveFriend: (friend: Friend) => void;
  onDeleteFriend: (id: string) => void;
  onViewFriendRestaurants: (friendId: string) => void;
}

export const FriendManager: React.FC<FriendManagerProps> = ({
  friends,
  restaurants,
  lang,
  onSaveFriend,
  onDeleteFriend,
  onViewFriendRestaurants,
}) => {
  const t = translations[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setEditingFriend(null);
    setIsModalOpen(true);
  };

  const handleEdit = (friend: Friend) => {
    setEditingFriend(friend);
    setIsModalOpen(true);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.favoriteTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    f.dislikedTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👥</span>
            <h2 className="text-2xl font-black tracking-tight">{t.friendsBannerTitle}</h2>
          </div>
          <p className="text-purple-100 text-sm max-w-xl leading-relaxed">
            {t.friendsBannerDesc}
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="px-5 py-2.5 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 font-black text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.btnAddNewFriend}</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchFriendPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>

        <div className="text-xs font-bold text-slate-500 shrink-0">
          {filteredFriends.length} {t.friendsCountLabel}
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFriends.map((friend) => {
          const recommendedCount = restaurants.filter((r) =>
            r.recommendedByFriendIds?.includes(friend.id)
          ).length;

          const dinedTogetherCount = restaurants.filter((r) =>
            r.dinedWithFriendIds?.includes(friend.id)
          ).length;

          return (
            <div
              key={friend.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                      {friend.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">
                        {friend.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{t.friendRecommendedCount} {recommendedCount} {t.placesUnit}</span>
                        <span>·</span>
                        <span>{t.friendDinedCount} {dinedTogetherCount} {t.timesUnit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(friend)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title={t.editSpot}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const confirmMsg = lang === 'zh-TW'
                          ? `確定要刪除好友「${friend.name}」嗎？`
                          : `「${friend.name}」を削除しますか？`;
                        if (confirm(confirmMsg)) {
                          onDeleteFriend(friend.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title={t.deleteSpot}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                    <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                    <span>{t.friendLikesTitle}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {friend.favoriteTags.length > 0 ? (
                      friend.favoriteTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">{t.noPreferencesYet}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-800">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t.friendDislikesTitle}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {friend.dislikedTags.length > 0 ? (
                      friend.dislikedTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200"
                        >
                          ⚠️ {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">{t.noDislikes}</span>
                    )}
                  </div>
                </div>

                {friend.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                    💡 {friend.notes}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onViewFriendRestaurants(friend.id)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>{t.btnViewFriendSpots} ({recommendedCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <FriendTasteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveFriend}
        editingFriend={editingFriend}
        lang={lang}
      />
    </div>
  );
};
