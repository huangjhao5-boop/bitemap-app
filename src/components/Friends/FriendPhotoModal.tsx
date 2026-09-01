import React from 'react';
import type { Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { X, Heart, AlertOctagon, UtensilsCrossed, Edit2, Camera, User } from 'lucide-react';

interface FriendPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  onViewFriendRestaurants?: (friendId: string) => void;
  onEditFriend?: (friend: Friend) => void;
  lang: Language;
}

export const FriendPhotoModal: React.FC<FriendPhotoModalProps> = ({
  isOpen,
  onClose,
  friend,
  onViewFriendRestaurants,
  onEditFriend,
  lang,
}) => {
  if (!isOpen || !friend) return null;

  const isImageAvatar = Boolean(
    friend.avatar &&
      (friend.avatar.startsWith('data:') || friend.avatar.startsWith('http') || friend.avatar.length > 20)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪪</span>
            <div>
              <h3 className="text-sm font-black text-white">
                {friend.customNickname ? `${friend.customNickname} (${friend.name})` : friend.name}
              </h3>
              <p className="text-[11px] text-purple-300 font-mono">
                @{friend.foodieId || 'foodie'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big HD Photo Display */}
        <div className="p-6 bg-gradient-to-b from-purple-50/50 to-white flex flex-col items-center justify-center border-b border-slate-100 shrink-0">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-purple-100 flex items-center justify-center ring-4 ring-purple-200/50">
            {isImageAvatar ? (
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-7xl select-none">{friend.avatar || '🥢'}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-bold mt-2.5">
            🔍 吃貨好友高清頭像照片
          </p>
        </div>

        {/* Friend Details & Bio */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
          {/* Bio / Foodie Declaration */}
          {friend.bio && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-black text-slate-500 block">💬 自介與美食宣言：</span>
              <p className="font-medium italic leading-relaxed text-slate-800">
                "{friend.bio}"
              </p>
            </div>
          )}

          {/* Instagram Handle if available */}
          {friend.instagramHandle && (
            <div className="flex items-center gap-1.5 text-pink-600 font-bold bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200/60">
              <Camera className="w-3.5 h-3.5" />
              <span>Instagram: @{friend.instagramHandle.replace(/^@/, '')}</span>
            </div>
          )}

          {/* Likes & Dislikes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-900 flex items-center gap-1">
                <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>他喜歡的口味：</span>
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {(friend.favoriteTags || []).length > 0 ? (
                  friend.favoriteTags.map((t, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[10px]">尚無特定偏好</span>
                )}
              </div>
            </div>

            <div className="space-y-1 bg-rose-50/70 p-3 rounded-2xl border border-rose-100">
              <span className="text-[10px] font-black text-rose-900 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-rose-600" />
                <span>他不吃的雷區：</span>
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {(friend.dislikedTags || []).length > 0 ? (
                  friend.dislikedTags.map((t, i) => (
                    <span key={i} className="bg-rose-100 text-rose-950 font-bold px-2 py-0.5 rounded-lg text-[10px] line-through">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[10px]">無特定忌口</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          {onEditFriend && (
            <button
              onClick={() => {
                onClose();
                onEditFriend(friend);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-black text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>修改備註</span>
            </button>
          )}

          {onViewFriendRestaurants && (
            <button
              onClick={() => {
                onClose();
                onViewFriendRestaurants(friend.id);
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-200 transition-all cursor-pointer active:scale-95"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>查看他推薦的美食</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
