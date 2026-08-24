import React, { useState, useMemo } from 'react';
import type { Restaurant, Friend, UserProfile } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { calculateDistanceKm, type UserLocation } from '../../utils/geo';
import { 
  X, 
  Gift, 
  MapPin, 
  RefreshCw, 
  Users, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  friends: Friend[];
  userProfile: UserProfile;
  userLocation: UserLocation;
  lang: Language;
  onLocateOnMap: (restaurant: Restaurant) => void;
}

export const MysteryBoxModal: React.FC<MysteryBoxModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  friends,
  userProfile,
  userLocation,
  lang,
  onLocateOnMap,
}) => {
  const t = translations[lang];
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5); // default 5km
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    friends.length > 0 ? [friends[0].id] : []
  );

  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  // Toggle attending friend
  const toggleFriend = (id: string) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter((fid) => fid !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  // Combine all attending participants' dislikes (Your profile + selected friends)
  const allAttendingDislikes = useMemo(() => {
    const dislikes: { personName: string; tag: string }[] = [];

    // 1. User's own dislikes
    if (userProfile.dislikedTags && userProfile.dislikedTags.length > 0) {
      userProfile.dislikedTags.forEach((tag) => {
        dislikes.push({ personName: lang === 'zh-TW' ? '自己' : '自分', tag });
      });
    }

    // 2. Selected friends' dislikes
    const selectedFriends = friends.filter((f) => selectedFriendIds.includes(f.id));
    selectedFriends.forEach((f) => {
      f.dislikedTags.forEach((tag) => {
        dislikes.push({ personName: f.name, tag });
      });
    });

    return dislikes;
  }, [userProfile, friends, selectedFriendIds, lang]);

  // Candidates filtered by Distance AND Strict Dietary Dislikes!
  const validCandidates = useMemo(() => {
    return restaurants.filter((r) => {
      if (r.ratingTag === 'avoid_again') return false;

      // 1. Distance filter
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng);
      if (dist > selectedRadiusKm) return false;

      // 2. Dietary Dislike Conflict filter
      const hasConflict = allAttendingDislikes.some(({ tag }) => {
        const cleanTag = tag.replace(/^(不吃|怕|完全不吃|NG)/, '').trim();
        return (
          r.category.includes(cleanTag) ||
          r.name.includes(cleanTag) ||
          r.mustEatDishes.some((dish) => dish.includes(cleanTag))
        );
      });

      if (hasConflict) return false;

      return true;
    });
  }, [restaurants, userLocation, selectedRadiusKm, allAttendingDislikes]);

  if (!isOpen) return null;

  const handleOpenMysteryBox = () => {
    const pool = validCandidates.length > 0 ? validCandidates : restaurants.filter(r => r.ratingTag !== 'avoid_again');
    if (pool.length === 0) return;

    setIsOpening(true);
    setWinner(null);

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * pool.length);
      setWinner(pool[randomIdx]);
      setIsOpening(false);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-200" />
            <h2 className="text-base font-bold text-white">
              {lang === 'zh-TW' ? '🎁 美食盲盒抽籤機（自動避開全員忌口）' : '🎁 グルメミステリーボックス（全員のNG回避）'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-center">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              {lang === 'zh-TW' ? '今天不知道吃什麼？' : '今日何食べるか迷ったら？'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'zh-TW'
                ? '勾選今天一起吃的朋友，系統自動為所有人過濾忌口並抽出命定美食！'
                : '一緒に食べるメンバーを選択すると、全員のNG食材を自動回避して抽選します！'}
            </p>
          </div>

          {/* Attending Friends Selector */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{lang === 'zh-TW' ? '今天跟誰一起吃？' : '参加メンバー：'}</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                {selectedFriendIds.length + 1} {lang === 'zh-TW' ? '人同行' : '名'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                <span>{userProfile.avatar || '👑'}</span>
                <span>{userProfile.name || (lang === 'zh-TW' ? '自己' : '自分')}</span>
              </span>

              {friends.map((f) => {
                const isSelected = selectedFriendIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFriend(f.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{f.avatar}</span>
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Dislikes Shield Alert */}
            {allAttendingDislikes.length > 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-[11px] text-emerald-900 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{lang === 'zh-TW' ? '🛡️ 忌口守護盾已啟動：' : '🛡️ NG食材自動回避中：'}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {allAttendingDislikes.map(({ personName, tag }, idx) => (
                      <span key={idx} className="bg-white text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                        {personName}: {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                {lang === 'zh-TW' ? '💡 所有同行成員均無特殊忌口' : '💡 特殊なNG食材はありません'}
              </p>
            )}
          </div>

          {/* Radius Selector */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-left">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>📍 {lang === 'zh-TW' ? '探索距離半徑：' : '探索距離：'}</span>
              <span className="text-indigo-600 font-extrabold">{selectedRadiusKm} km</span>
            </label>
            <div className="flex gap-2">
              {[1, 3, 5, 10, 50].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setSelectedRadiusKm(km)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRadiusKm === km
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>
                {lang === 'zh-TW' 
                  ? `符合全員口味的候選店家：${validCandidates.length} 間` 
                  : `全員の条件を満たす候補店：${validCandidates.length} 件`}
              </span>
              {validCandidates.length === 0 && (
                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  {lang === 'zh-TW' ? '可嘗試擴大距離' : '距離を拡大してください'}
                </span>
              )}
            </div>
          </div>

          {/* Mystery Box Visual Display */}
          {!winner ? (
            <div className="py-4 space-y-4">
              <div
                onClick={handleOpenMysteryBox}
                className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-5xl shadow-xl shadow-rose-500/20 cursor-pointer transform hover:scale-105 active:scale-95 transition-all ${
                  isOpening ? 'animate-bounce' : 'animate-pulse'
                }`}
              >
                🎁
              </div>

              <button
                onClick={handleOpenMysteryBox}
                disabled={isOpening}
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isOpening ? (lang === 'zh-TW' ? '正在拆盲盒...' : '開封中...') : (lang === 'zh-TW' ? '✨ 開啟美食盲盒！' : '✨ ボックスを開封！')}
              </button>
            </div>
          ) : (
            /* Winner Card */
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-xl border border-slate-700 space-y-3 text-left animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                  🎉 {lang === 'zh-TW' ? '今日命中美食' : '本日のおすすめ'}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {winner.category} · {winner.priceRange}
                </span>
              </div>

              <div>
                <h4 className="text-xl font-black text-white">{winner.name}</h4>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{winner.city} · {winner.address}</span>
                </p>
              </div>

              {winner.mustEatDishes && winner.mustEatDishes.length > 0 && (
                <div className="bg-white/10 p-2.5 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-300 block">{t.mustEatDishesTitle}</span>
                  <div className="flex flex-wrap gap-1">
                    {winner.mustEatDishes.map((dish, i) => (
                      <span key={i} className="bg-white/20 px-2 py-0.5 rounded-md font-medium text-white">
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onLocateOnMap(winner);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{lang === 'zh-TW' ? '在地圖上導航' : 'マップで確認'}</span>
                </button>

                <button
                  onClick={handleOpenMysteryBox}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  title="再抽一次"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
