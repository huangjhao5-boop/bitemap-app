import React, { useState } from 'react';
import type { Friend } from '../../types';
import type { Language } from '../../utils/i18n';
import { translations } from '../../utils/i18n';
import { X, Calculator, Dices, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BillSplitterModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  lang: Language;
}

export const BillSplitterModal: React.FC<BillSplitterModalProps> = ({
  isOpen,
  onClose,
  friends,
  lang,
}) => {
  const t = translations[lang];

  const [totalAmount, setTotalAmount] = useState<string>('2400');
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(10);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    friends.map((f) => f.id)
  );

  // Roulette payer winner
  const [payerWinner, setPayerWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  if (!isOpen) return null;

  const totalNum = parseFloat(totalAmount) || 0;
  const finalTotal = totalNum * (1 + serviceFeePercent / 100);
  const participantCount = selectedFriendIds.length + 1; // Friends + You
  const perPersonAmount = participantCount > 0 ? Math.ceil(finalTotal / participantCount) : 0;

  const toggleFriend = (id: string) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter((fid) => fid !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  const handleSpinPayer = () => {
    const candidates = ['你 (Me)', ...friends.filter(f => selectedFriendIds.includes(f.id)).map(f => f.customNickname ? `${f.customNickname} (${f.name})` : f.name)];
    if (candidates.length === 0) return;

    setIsSpinning(true);
    setPayerWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * candidates.length);
      setPayerWinner(candidates[randomIdx]);
      counter++;

      if (counter > 16) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-300" />
            <h2 className="text-base font-bold text-white">
              {lang === 'zh-TW' ? '🎲 聚餐分帳與隨機買單轉盤' : '🎲 割り勘＆おごりルーレット'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Bill Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'zh-TW' ? '消費總金額 ($)' : '合計金額 (円)'}
              </label>
              <input
                type="number"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'zh-TW' ? '服務費 / 小費 (%)' : 'サービス料 (%)'}
              </label>
              <select
                value={serviceFeePercent}
                onChange={(e) => setServiceFeePercent(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                <option value={0}>0% (無服務費)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (標準服務費)</option>
                <option value={15}>15%</option>
              </select>
            </div>
          </div>

          {/* Attending Friends Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'zh-TW' ? '參加聚餐的朋友 (包含自己)：' : '参加メンバー (自分含む)：'}</span>
              </label>
              <span className="text-xs font-extrabold text-emerald-700">
                {participantCount} {lang === 'zh-TW' ? '人' : '名'}
              </span>
            </div>

                        <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                <span>👑</span>
                <span>{lang === 'zh-TW' ? '自己' : '自分'}</span>
              </span>

              {friends.map((f) => {
                const isSelected = selectedFriendIds.includes(f.id);
                const displayName = f.customNickname ? `${f.customNickname} (${f.name})` : f.name;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFriend(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                      {f.avatar && (f.avatar.startsWith('data:') || f.avatar.startsWith('http') || f.avatar.length > 20) ? (
                        <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">{f.avatar || '🥢'}</span>
                      )}
                    </div>
                    <span>{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculation Result Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-100 font-bold block">
                {lang === 'zh-TW' ? '每人平均應付金額 (含服務費)' : '1人あたりの金額'}
              </span>
              <div className="text-3xl font-black mt-1">
                ${perPersonAmount}
              </div>
            </div>

            <div className="text-right text-xs text-emerald-100 space-y-0.5">
              <div>{lang === 'zh-TW' ? '總金額：' : '合計：'} ${Math.round(finalTotal)}</div>
              <div>{lang === 'zh-TW' ? '總人數：' : '人數：'} {participantCount} 人</div>
            </div>
          </div>

          {/* Random Roulette Payer Tool */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  {lang === 'zh-TW' ? '🎲 請客轉盤 / 抽誰買單請喝飲料' : '🎲 おごりルーレット'}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleSpinPayer}
                disabled={isSpinning}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? (lang === 'zh-TW' ? '抽籤中...' : '抽選中...') : (lang === 'zh-TW' ? '轉盤抽一人！' : 'ルーレットスタート！')}
              </button>
            </div>

            {payerWinner && (
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-xl text-center animate-fadeIn">
                <span className="text-xs text-purple-900 font-bold block">
                  🎉 {lang === 'zh-TW' ? '恭喜幸運請客苦主：' : '当選者：'}
                </span>
                <span className="text-lg font-black text-purple-950 mt-0.5 block">
                  {payerWinner}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {t.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
};
