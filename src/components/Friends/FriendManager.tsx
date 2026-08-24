import React, { useState } from 'react';
import type { Friend, Restaurant, DiningMeetup, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { FriendTasteModal } from './FriendTasteModal';
import { FriendIdModal } from './FriendIdModal';
import { FriendRequestsInbox } from './FriendRequestsInbox';
import type { FriendRequest } from '../../types';
import { MeetupCreateModal } from './MeetupCreateModal';
import { MeetupCard } from './MeetupCard';
import { 
  UserPlus, 
  Heart, 
  AlertOctagon, 
  Edit2, 
  Trash2, 
  UtensilsCrossed, 
  Search,
  MessageSquarePlus,
  Radio,
  Users
} from 'lucide-react';

interface FriendManagerProps {
  friends: Friend[];
  friendRequests: FriendRequest[];
  restaurants: Restaurant[];
  meetups: DiningMeetup[];
  userProfile: UserProfile;
  lang: Language;
  onSaveFriend: (friend: Friend) => void;
  onDeleteFriend: (id: string) => void;
  onViewFriendRestaurants: (friendId: string) => void;
  onSaveMeetup: (meetup: DiningMeetup) => void;
  onDeleteMeetup: (meetupId: string) => void;
  onJoinMeetup: (meetupId: string) => void;
  onInterestedMeetup: (meetupId: string) => void;
  onAddMeetupComment: (meetupId: string, content: string) => void;
  onAcceptFriendRequest: (request: FriendRequest) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onSendFriendRequest: (targetCode: string) => { success: boolean; message: string };
}

export const FriendManager: React.FC<FriendManagerProps> = ({
  friends,
  restaurants,
  meetups,
  userProfile,
  lang,
  onSaveFriend,
  onDeleteFriend,
  onViewFriendRestaurants,
  onSaveMeetup,
  onDeleteMeetup,
  onJoinMeetup,
  onInterestedMeetup,
  onAddMeetupComment,
  friendRequests,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onSendFriendRequest,
}) => {
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [idModalTab, setIdModalTab] = useState<'my_id' | 'add_by_id' | 'restore'>('add_by_id');
  const t = translations[lang];
  const [subTab, setSubTab] = useState<'bulletin' | 'friends'>('bulletin');
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNewFriend = () => {
    setEditingFriend(null);
    setIsFriendModalOpen(true);
  };

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setIsFriendModalOpen(true);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.favoriteTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    f.dislikedTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {lang === 'zh-TW' ? '吃貨朋友圈 & 揪團開飯留言板' : 'グルメフレンド＆食事会募集'}
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            {lang === 'zh-TW'
              ? '即時發布聚餐邀請、自訂公開或閨蜜限定範圍、自動比對全員忌口避雷！'
              : '食事会イベントの募集・参加登録・苦手な食材の自動回避'}
          </p>
                {/* Foodie ID & Add Friend Quick Triggers */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 w-full sm:w-auto">
          <button
            onClick={() => { setIdModalTab('my_id'); setIsIdModalOpen(true); }}
            className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>🪪 我的吃貨 ID：{userProfile.foodieId || 'kaw_foodie'}</span>
          </button>

          <button
            onClick={() => { setIdModalTab('add_by_id'); setIsIdModalOpen(true); }}
            className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>➕ 輸入 ID 加吃貨好友</span>
          </button>
        </div>
        </div>

        {/* Dual Tab Switcher */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-2xl">
          <button
            onClick={() => setSubTab('bulletin')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
              subTab === 'bulletin'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{lang === 'zh-TW' ? `📢 揪團留言板 (${meetups.length})` : `📢 募集掲示板 (${meetups.length})`}</span>
          </button>

          <button
            onClick={() => setSubTab('friends')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
              subTab === 'friends'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'zh-TW' ? `👥 好友名冊 (${friends.length})` : `👥 フレンド (${friends.length})`}</span>
          </button>
        </div>
      </div>

      {/* 📬 Incoming Pending Friend Requests Box */}
      <FriendRequestsInbox
        requests={friendRequests}
        onAcceptRequest={onAcceptFriendRequest}
        onDeclineRequest={onDeclineFriendRequest}
      />
      {/* 📢 Sub-Tab 1: Meetup & Dining Calls Bulletin Board */}
      {subTab === 'bulletin' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {lang === 'zh-TW' ? '🔥 最新聚餐邀請與開飯貼文' : '🔥 最新の食事会募集'}
              </h3>
              <p className="text-xs text-slate-400">點擊 +1 報名或直接轉發至 LINE 群組揪人！</p>
            </div>

            <button
              onClick={() => setIsMeetupModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{lang === 'zh-TW' ? '➕ 發布聚餐邀請' : '➕ 食事会を募集する'}</span>
            </button>
          </div>

          {meetups.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">目前還沒有聚餐邀請</h3>
              <p className="text-xs text-slate-400">點擊右上角「發布聚餐邀請」，找吃貨朋友一起吃大餐吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetups.map((meetup) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  friends={friends}
                  userProfile={userProfile}
                  lang={lang}
                  onJoinMeetup={onJoinMeetup}
                  onInterestedMeetup={onInterestedMeetup}
                  onAddComment={onAddMeetupComment}
                  onDeleteMeetup={onDeleteMeetup}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 👥 Sub-Tab 2: Friends Taste & Dislikes Manager */}
      {subTab === 'friends' && (
        <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchFriendPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => { setIdModalTab('add_by_id'); setIsIdModalOpen(true); }}
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>➕ 輸入 ID 加好友</span>
              </button>

              <button
                onClick={handleAddNewFriend}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                title="手動建立朋友口味備忘"
              >
                <span>📝 手動自建</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFriends.map((friend) => {
              const friendRecommendations = restaurants.filter((r) =>
                r.recommendedByFriendIds?.includes(friend.id)
              );

              return (
                <div
                  key={friend.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5 hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl shadow-2xs">
                        {friend.avatar}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{friend.name}</h4>
                        <button
                          onClick={() => onViewFriendRestaurants(friend.id)}
                          className="text-[11px] text-purple-600 hover:underline font-bold"
                        >
                          {friendRecommendations.length} {t.friendRecommendedCount}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditFriend(friend)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                        title={t.editSpot}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFriend(friend.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Favorite Tags */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>{t.friendLikesTitle}</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {friend.favoriteTags.map((tag, i) => (
                        <span key={i} className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Disliked Tags */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-800 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-rose-500" />
                      <span>{t.friendDislikesTitle}</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {friend.dislikedTags.map((tag, i) => (
                        <span key={i} className="text-[11px] font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-lg border border-rose-100 line-through">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <FriendTasteModal
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        onSave={onSaveFriend}
        editingFriend={editingFriend}
        lang={lang}
      />

      <MeetupCreateModal
        isOpen={isMeetupModalOpen}
        onClose={() => setIsMeetupModalOpen(false)}
        onSave={onSaveMeetup}
        restaurants={restaurants}
        friends={friends}
        userProfile={userProfile}
        lang={lang}
      />
      <FriendIdModal
        isOpen={isIdModalOpen}
        initialTab={idModalTab}
        onClose={() => setIsIdModalOpen(false)}
        userProfile={userProfile}
        friends={friends}
        lang={lang}
        onSendFriendRequest={onSendFriendRequest}
      />
    </div>
  );
};
