import React, { useState, useMemo } from 'react';
import type { Friend, Restaurant } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { RestaurantCard } from '../Restaurant/RestaurantCard';
import { 
  Dices, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GroupDiningMatcherProps {
  friends: Friend[];
  restaurants: Restaurant[];
  lang: Language;
  onIncrementVisit: (id: string) => void;
  onEditRestaurant: (restaurant: Restaurant) => void;
  onDeleteRestaurant: (id: string) => void;
  onShareRestaurant: (restaurant: Restaurant) => void;
  onLocateOnMap: (restaurant: Restaurant) => void;
}

export const GroupDiningMatcher: React.FC<GroupDiningMatcherProps> = ({
  friends,
  restaurants,
  lang,
  onIncrementVisit,
  onEditRestaurant,
  onDeleteRestaurant,
  onShareRestaurant,
  onLocateOnMap,
}) => {
  const t = translations[lang];

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    friends.length >= 2 ? [friends[0].id, friends[1].id] : friends.map(f => f.id)
  );

  const [randomWinner, setRandomWinner] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const toggleFriend = (id: string) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter((fid) => fid !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  const selectedFriends = useMemo(() => {
    return friends.filter((f) => selectedFriendIds.includes(f.id));
  }, [friends, selectedFriendIds]);

  const allFavorites = useMemo(() => {
    const list: string[] = [];
    selectedFriends.forEach((f) => {
      f.favoriteTags.forEach((t) => {
        if (!list.includes(t)) list.push(t);
      });
    });
    return list;
  }, [selectedFriends]);

  const allDislikes = useMemo(() => {
    const list: string[] = [];
    selectedFriends.forEach((f) => {
      f.dislikedTags.forEach((t) => {
        if (!list.includes(t)) list.push(t);
      });
    });
    return list;
  }, [selectedFriends]);

  const scoredRestaurants = useMemo(() => {
    if (selectedFriends.length === 0) return [];

    return restaurants
      .filter((r) => r.ratingTag !== 'avoid_again')
      .map((r) => {
        let score = 0;
        const matchedLikes: string[] = [];
        const conflictDislikes: { friendName: string; tag: string }[] = [];

        selectedFriends.forEach((f) => {
          f.favoriteTags.forEach((fav) => {
            if (
              r.category.includes(fav) ||
              r.name.includes(fav) ||
              r.mustEatDishes.some((dish) => dish.includes(fav)) ||
              r.personalNotes.includes(fav)
            ) {
              score += 3;
              if (!matchedLikes.includes(fav)) matchedLikes.push(`${f.name}: ${fav}`);
            }
          });

          f.dislikedTags.forEach((dis) => {
            const cleanTag = dis.replace(/^(不吃|怕|完全不吃|NG)/, '');
            if (
              r.category.includes(cleanTag) ||
              r.name.includes(cleanTag) ||
              r.mustEatDishes.some((dish) => dish.includes(cleanTag))
            ) {
              score -= 5;
              conflictDislikes.push({ friendName: f.name, tag: dis });
            }
          });
        });

        if (r.ratingTag === 'must_eat') score += 2;
        if (r.ratingTag === 'frequent_visit') score += 1;

        return {
          restaurant: r,
          score,
          matchedLikes,
          conflictDislikes,
          hasConflict: conflictDislikes.length > 0,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [restaurants, selectedFriends]);

  const handleRandomPick = () => {
    if (scoredRestaurants.length === 0) return;
    setIsSpinning(true);
    setRandomWinner(null);

    let counter = 0;
    const candidates = scoredRestaurants.slice(0, 6);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * candidates.length);
      setRandomWinner(candidates[randomIdx].restaurant);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl font-black tracking-tight">{t.matcherBannerTitle}</h2>
          </div>
          <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
            {t.matcherBannerDesc}
          </p>
        </div>

        <button
          onClick={handleRandomPick}
          disabled={isSpinning || scoredRestaurants.length === 0}
          className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? t.btnSpinning : t.btnSpinRoulette}</span>
        </button>
      </div>

      {/* Friend Selector Badges */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{t.selectAttendingFriends}</span>
          </label>
          <span className="text-xs font-bold text-slate-500">
            {t.selectedCount} {selectedFriends.length} {t.peopleUnit}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {friends.map((f) => {
            const isSelected = selectedFriendIds.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFriend(f.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{f.avatar}</span>
                <span>{f.name}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {selectedFriends.length > 0 && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-900 block mb-1">
                {t.mutualFavoritesTitle}
              </span>
              <div className="flex flex-wrap gap-1">
                {allFavorites.slice(0, 8).map((fav) => (
                  <span
                    key={fav}
                    className="bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium"
                  >
                    {fav}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
              <span className="font-bold text-rose-900 block mb-1">
                {t.mutualDislikesTitle}
              </span>
              <div className="flex flex-wrap gap-1">
                {allDislikes.map((dis) => (
                  <span
                    key={dis}
                    className="bg-white text-rose-800 px-2 py-0.5 rounded-md border border-rose-200 font-medium"
                  >
                    {dis}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Random Roulette Winner Banner */}
      {randomWinner && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-1 rounded-3xl shadow-xl animate-bounce-short">
          <div className="bg-white p-5 rounded-[22px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-2xl flex items-center justify-center shrink-0">
                🎉
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {t.rouletteWinnerTitle}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {randomWinner.name} ({randomWinner.category})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {randomWinner.address} · {randomWinner.mustEatDishes[0] || 'Special'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLocateOnMap(randomWinner)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
              >
                {t.locateOnMap}
              </button>
              <button
                onClick={() => onShareRestaurant(randomWinner)}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all"
              >
                {t.shareNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matched Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{t.matchedSpotsRanking} ({scoredRestaurants.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            {t.matchedSpotsRankingDesc}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoredRestaurants.map(({ restaurant, score, matchedLikes, conflictDislikes, hasConflict }) => {
            return (
              <div key={restaurant.id} className="relative flex flex-col">
                <div
                  className={`px-3.5 py-2 rounded-t-2xl text-xs font-bold flex items-center justify-between border-t border-x ${
                    hasConflict
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : score > 2
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {hasConflict ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">
                          {t.conflictWarning} {conflictDislikes.map((c) => `${c.friendName}(${c.tag})`).join(', ')}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {matchedLikes.length > 0
                            ? `${t.perfectMatch} ${matchedLikes.slice(0, 2).join('、')}`
                            : t.generalMatch}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-white text-[10px] font-black shadow-2xs border">
                    {t.matchScore} {score > 0 ? `+${score}` : score}
                  </span>
                </div>

                <div className="-mt-1">
                  <RestaurantCard
                    restaurant={restaurant}
                    friends={friends}
                    lang={lang}
                    onIncrementVisit={onIncrementVisit}
                    onEdit={onEditRestaurant}
                    onDelete={onDeleteRestaurant}
                    onShare={onShareRestaurant}
                    onLocateOnMap={onLocateOnMap}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
