import React, { useState, useRef } from 'react';
import type { DiningMeetup, Friend, UserProfile } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Send, 
  MessageSquare, 
  UserCheck, 
  Eye, 
  Trash2,
  Share2,
  Camera,
  X,
  Maximize2
} from 'lucide-react';

interface MeetupCardProps {
  meetup: DiningMeetup;
  friends: Friend[];
  userProfile: UserProfile;
  lang?: string;
  onJoinMeetup: (meetupId: string) => void;
  onInterestedMeetup: (meetupId: string) => void;
  onAddComment: (meetupId: string, content: string, image?: string) => void;
  onDeleteMeetup: (meetupId: string) => void;
}

export const MeetupCard: React.FC<MeetupCardProps> = ({
  meetup,
  userProfile,
  onJoinMeetup,
  onInterestedMeetup,
  onAddComment,
  onDeleteMeetup,
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isJoined = meetup.joinedFriendIds.includes('me') || meetup.joinedFriendIds.includes(userProfile.name);
  const isInterested = meetup.interestedFriendIds.includes('me') || meetup.interestedFriendIds.includes(userProfile.name);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCommentImage(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;

    onAddComment(meetup.id, commentText.trim(), commentImage || undefined);
    setCommentText('');
    setCommentImage(null);
    setShowComments(true);
  };

  // 💬 Generate 1-Click LINE Group Meetup Invite
  const handleLineInvite = () => {
    let msg = `🍲 【吃貨揪團開飯啦！】\n`;
    msg += `📌 活動：${meetup.title}\n`;
    if (meetup.restaurantName) {
      msg += `🏪 餐廳：${meetup.restaurantName}\n`;
    }
    msg += `⏰ 時間：${meetup.plannedDate}\n`;
    if (meetup.description) {
      msg += `💬 說明：${meetup.description}\n`;
    }
    if (meetup.googleMapsUrl) {
      msg += `\n📍 Google Maps 導航：\n${meetup.googleMapsUrl}\n\n`;
    }
    msg += `👥 目前 +1 報名：${meetup.joinedFriendIds.length} 人\n`;
    msg += `— 快來 BiteMap 一起開飯！`;

    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-400 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 p-[2px] flex items-center justify-center text-lg shadow-2xs">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              {meetup.creatorAvatar || '🥢'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm text-slate-900">{meetup.title}</h4>
              {meetup.audience === 'friends_only' && (
                <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200">
                  👯 閨蜜限定
                </span>
              )}
              {meetup.audience === 'public' && (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  🌐 公開
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">主揪：{meetup.creatorName} · {meetup.createdAt}</p>
          </div>
        </div>

        <button
          onClick={() => onDeleteMeetup(meetup.id)}
          className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          title="刪除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Meetup Details */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
        {meetup.restaurantName && (
          <div className="flex items-center gap-1.5 font-black text-slate-800">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{meetup.restaurantName}</span>
            {meetup.googleMapsUrl && (
              <a
                href={meetup.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-600 underline font-bold ml-auto"
              >
                導航
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{meetup.plannedDate}</span>
        </div>

        {meetup.description && (
          <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/60">
            "{meetup.description}"
          </p>
        )}
      </div>

      {/* Actions: +1 / Interested / LINE Invite */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => onJoinMeetup(meetup.id)}
          className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
            isJoined
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>{isJoined ? '已 +1 報名' : '🙋 算我 +1'}</span>
          <span className="ml-0.5 text-[10px] opacity-80">({meetup.joinedFriendIds.length})</span>
        </button>

        <button
          onClick={() => onInterestedMeetup(meetup.id)}
          className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
            isInterested
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isInterested ? '已卡位' : '👀 感興趣'}</span>
          <span className="ml-0.5 text-[10px] opacity-80">({meetup.interestedFriendIds.length})</span>
        </button>

        <button
          onClick={handleLineInvite}
          className="py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-black flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>LINE 揪團</span>
        </button>
      </div>

      {/* Comment Section Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowComments(!showComments)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>聚餐留言討論區 ({meetup.comments.length} 則留言)</span>
          </span>
          <span className="text-[11px] text-purple-600 font-black">
            {showComments ? '收合' : '展開討論'}
          </span>
        </button>

        {showComments && (
          <div className="mt-3 space-y-3 animate-fadeIn">
            {/* Comment List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {meetup.comments.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-2">
                  還沒有人留言，快上傳菜單或約定自帶酒水吧！
                </p>
              ) : (
                meetup.comments.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-slate-800 flex items-center gap-1">
                        <span>{c.authorAvatar}</span>
                        <span>{c.authorName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                    </div>

                    {c.content && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {c.content}
                      </p>
                    )}

                    {/* 📷 留言附加的照片 (點擊可放大) */}
                    {c.image && (
                      <div className="relative group mt-1.5 inline-block">
                        <img
                          src={c.image}
                          alt="留言照片"
                          onClick={() => setPreviewModalImg(c.image!)}
                          className="max-h-36 max-w-full rounded-xl object-cover border border-slate-200 shadow-2xs hover:opacity-90 transition-all cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewModalImg(c.image!)}
                          className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Image Preview before sending */}
            {commentImage && (
              <div className="relative inline-block bg-slate-100 p-1.5 rounded-2xl border border-slate-300">
                <img
                  src={commentImage}
                  alt="預覽上傳圖片"
                  className="w-16 h-16 object-cover rounded-xl shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setCommentImage(null)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Add Comment Input Form */}
            <form onSubmit={handleSendComment} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="寫下留言、詢問自帶酒水或交通..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50 font-medium"
              />

              {/* 📷 圖片上傳按鈕 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                  commentImage
                    ? 'bg-purple-100 border-purple-400 text-purple-700'
                    : 'bg-slate-100 hover:bg-purple-50 border-slate-200 text-slate-600 hover:text-purple-600'
                }`}
                title="上傳菜單、座位或美食照片"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <button
                type="submit"
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>送出</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 🔍 照片放大檢視 Lightbox Modal */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-black p-1 shadow-2xl">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImg}
              alt="放大檢視"
              className="max-h-[80vh] w-auto rounded-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
