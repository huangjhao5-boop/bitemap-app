import React, { useState } from 'react';
import type { DiningMeetup, Restaurant, Friend, UserProfile, MeetupAudience } from '../../types';
import type { Language } from '../../utils/i18n';
import { X, Calendar, Globe, Lock, Users, Sparkles, MapPin } from 'lucide-react';

interface MeetupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meetup: DiningMeetup) => void;
  restaurants: Restaurant[];
  friends: Friend[];
  userProfile: UserProfile;
  lang: Language;
}

export const MeetupCreateModal: React.FC<MeetupCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  restaurants,
  friends,
  userProfile,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    restaurants.length > 0 ? restaurants[0].id : ''
  );
  const [customRestaurantName, setCustomRestaurantName] = useState('');
  const [plannedDate, setPlannedDate] = useState('本週五 19:30');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<MeetupAudience>('public');
  const [targetFriendIds, setTargetFriendIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(lang === 'zh-TW' ? '請輸入聚餐活動主題！' : 'イベント名を入力してください！');
      return;
    }

    const linkedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

    const newMeetup: DiningMeetup = {
      id: 'm_' + Date.now(),
      title: title.trim(),
      restaurantId: linkedRestaurant ? linkedRestaurant.id : undefined,
      restaurantName: linkedRestaurant ? linkedRestaurant.name : (customRestaurantName.trim() || '神秘餐廳'),
      category: linkedRestaurant?.category || '美食聚餐',
      address: linkedRestaurant?.address,
      googleMapsUrl: linkedRestaurant?.googleMapsUrl,
      plannedDate: plannedDate.trim() || '近期相約',
      description: description.trim(),
      creatorName: userProfile.name || '吃貨好友',
      creatorAvatar: userProfile.avatar || '🧋',
      audience,
      targetFriendIds: audience === 'friends_only' ? targetFriendIds : undefined,
      joinedFriendIds: [],
      interestedFriendIds: [],
      comments: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    onSave(newMeetup);
    onClose();
  };

  const toggleTargetFriend = (id: string) => {
    if (targetFriendIds.includes(id)) {
      setTargetFriendIds(targetFriendIds.filter((fId) => fId !== id));
    } else {
      setTargetFriendIds([...targetFriendIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍲</span>
            <h2 className="text-sm sm:text-base font-black text-white">
              {lang === 'zh-TW' ? '發布聚餐邀請 · 揪團開飯' : '食事会・グルメオフ会を募集'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              {lang === 'zh-TW' ? '聚餐主題 / 揪團口號 *' : 'タイトル・募集テーマ *'}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'zh-TW' ? '例如：週五下班衝和牛燒肉小酌！誰要跟？🥩' : '例：金曜夜に和牛焼肉行きませんか？'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Restaurant Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'zh-TW' ? '選擇聚餐店家：' : 'お店を選択：'}</span>
            </label>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{lang === 'zh-TW' ? '➕ 自行輸入其他餐廳名稱' : '➕ その他手入力'}</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category} · {r.city})
                </option>
              ))}
            </select>

            {!selectedRestaurantId && (
              <input
                type="text"
                placeholder={lang === 'zh-TW' ? '請輸入餐廳名稱' : '店舗名を入力'}
                value={customRestaurantName}
                onChange={(e) => setCustomRestaurantName(e.target.value)}
                className="mt-2 w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'zh-TW' ? '預計時間：' : '予定日時：'}</span>
            </label>
            <input
              type="text"
              placeholder="例如：本週五 19:30 或 週末中午"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Audience / Privacy Setting */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
              <span>{lang === 'zh-TW' ? '公開對象 / 邀請範圍：' : '公開範囲：'}</span>
              <span className="text-[11px] font-bold text-amber-600">
                {audience === 'public' && '🌐 全員公開'}
                {audience === 'friends_only' && `👯 指定好友 (${targetFriendIds.length} 人)`}
                {audience === 'private' && '🔒 私人草稿'}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAudience('public')}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  audience === 'public'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }`}
              >
                <Globe className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">{lang === 'zh-TW' ? '全員公開' : '全員公開'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAudience('friends_only')}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  audience === 'friends_only'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }`}
              >
                <Users className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">{lang === 'zh-TW' ? '指定好友' : '指定フレンド'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAudience('private')}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  audience === 'private'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }`}
              >
                <Lock className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">{lang === 'zh-TW' ? '私人僅自己' : '自分のみ'}</span>
              </button>
            </div>

            {/* Target Friends Checklist (When friends_only is selected) */}
            {audience === 'friends_only' && (
              <div className="mt-2.5 p-3 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2 animate-fadeIn">
                <span className="text-[11px] font-bold text-purple-900 block">
                  {lang === 'zh-TW' ? '勾選可看見此邀請的好友：' : '対象のフレンドを選択：'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                  {friends.map((f) => {
                    const isSelected = targetFriendIds.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleTargetFriend(f.id)}
                        className={`p-2 rounded-xl text-left text-xs flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-purple-100/60 border border-purple-200/60'
                        }`}
                      >
                        <span>{f.avatar}</span>
                        <span className="truncate">{f.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              {lang === 'zh-TW' ? '詳細說明與備註：' : '備考・メッセージ：'}
            </label>
            <textarea
              rows={3}
              placeholder={lang === 'zh-TW' ? '例如：慶祝專案順利上線！目前有 2 位，想再揪 2 位愛吃牛舌的朋友～' : '人数やアピールポイントなどを記入'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
            >
              {lang === 'zh-TW' ? '取消' : 'キャンセル'}
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'zh-TW' ? '🚀 發布開飯邀請' : '募集を開始'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
