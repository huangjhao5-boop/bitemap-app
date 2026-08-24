import React, { useState } from 'react';
import type { DiningMeetup, Friend, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Globe, 
  Lock, 
  Send, 
  MessageSquare, 
  Check, 
  UserPlus, 
  Trash2,
  Share2
} from 'lucide-react';

interface MeetupCardProps {
  meetup: DiningMeetup;
  friends: Friend[];
  userProfile: UserProfile;
  lang: Language;
  onJoinMeetup: (meetupId: string) => void;
  onInterestedMeetup: (meetupId: string) => void;
  onAddComment: (meetupId: string, content: string) => void;
  onDeleteMeetup: (meetupId: string) => void;
}

export const MeetupCard: React.FC<MeetupCardProps> = ({
  meetup,
  friends,
  userProfile,
  lang,
  onJoinMeetup,
  onInterestedMeetup,
  onAddComment,
  onDeleteMeetup,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isJoined = meetup.joinedFriendIds.includes('me') || meetup.joinedFriendIds.includes(userProfile.name);
  const isInterested = meetup.interestedFriendIds.includes('me') || meetup.interestedFriendIds.includes(userProfile.name);

  const joinedFriends = friends.filter((f) => meetup.joinedFriendIds.includes(f.id));

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(meetup.id, commentText.trim());
    setCommentText('');
    setShowComments(true);
  };

  // 💬 Generate 1-Click LINE Group Meetup Invite
  const handleLineInvite = () => {
    let msg = `🍲 【吃貨揪團開飯啦！】
`;
    msg += `📌 活動：${meetup.title}
`;
    msg += `🏪 餐廳：${meetup.restaurantName} (${meetup.category || '美食'})
`;
    msg += `⏰ 時間：${meetup.plannedDate}
`;
    if (meetup.address) {
      msg += `📍 地址：${meetup.address}
`;
    }
    if (meetup.googleMapsUrl) {
      msg += `🗺️ 地圖導航：
${meetup.googleMapsUrl}
`;
    }
    if (joinedFriends.length > 0) {
      msg += `🙋 目前已報名：${joinedFriends.map((f) => f.name).join('、')}
`;
    }
    if (meetup.description) {
      msg += `💬 主揪備註：${meetup.description}
`;
    }
    msg += `✨ 由 @${meetup.creatorName} 發起
— 來自 BiteMap 吃貨朋友圈`;

    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all">
      {/* Top Banner: Creator & Audience Scope */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg shadow-2xs">
            {meetup.creatorAvatar || '🧋'}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">{meetup.creatorName}</h4>
            <p className="text-[10px] text-slate-400">發起了聚餐邀請</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {meetup.audience === 'public' && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-500" />
              <span>全員公開</span>
            </span>
          )}
          {meetup.audience === 'friends_only' && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-500" />
              <span>指定好友限定</span>
            </span>
          )}
          {meetup.audience === 'private' && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>私密</span>
            </span>
          )}

          <button
            onClick={() => onDeleteMeetup(meetup.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
            title="刪除邀請"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-2">
        <h3 className="text-base font-black text-slate-900 leading-snug">
          {meetup.title}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-xl border border-amber-200/80 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>{meetup.plannedDate}</span>
          </span>

          <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{meetup.restaurantName}</span>
          </span>
        </div>

        {meetup.description && (
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
            {meetup.description}
          </p>
        )}
      </div>

      {/* Joined Friends List */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-black text-slate-700">
            🙋 已報名 ({meetup.joinedFriendIds.length} 人)：
          </span>
          {joinedFriends.length === 0 ? (
            <span className="text-[11px] text-slate-400">目前尚無人報名，快來搶頭香！</span>
          ) : (
            joinedFriends.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200"
              >
                <span>{f.avatar}</span>
                <span>{f.name}</span>
              </span>
            ))
          )}
        </div>

        <button
          onClick={handleLineInvite}
          className="px-2.5 py-1 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active:scale-95 transition-all shrink-0"
          title="發送 LINE 揪團邀請卡"
        >
          <Share2 className="w-3 h-3" />
          <span>LINE 揪團</span>
        </button>
      </div>

      {/* RSVP Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onJoinMeetup(meetup.id)}
          className={`py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
            isJoined
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {isJoined ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>{isJoined ? '已確認 +1 參加' : '🙋 算我一個 (+1)'}</span>
        </button>

        <button
          onClick={() => onInterestedMeetup(meetup.id)}
          className={`py-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
            isInterested
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>👀 感興趣先卡位 ({meetup.interestedFriendIds.length})</span>
        </button>
      </div>

      {/* Comment Section Toggle & List */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
          <span>留言討論區 ({meetup.comments.length} 則留言)</span>
        </button>

        {showComments && (
          <div className="space-y-2 pt-1 animate-fadeIn">
            {meetup.comments.map((c) => (
              <div key={c.id} className="p-2.5 bg-slate-50 rounded-2xl text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 flex items-center gap-1">
                    <span>{c.authorAvatar}</span>
                    <span>{c.authorName}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                </div>
                <p className="text-slate-600 pl-5">{c.content}</p>
              </div>
            ))}

            {/* Add Comment Input */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder={lang === 'zh-TW' ? '留言聊聊（如：我下班直接過去、這家超好吃）...' : 'コメントを入力...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
