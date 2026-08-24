import React from 'react';
import type { Language } from '../../utils/i18n';
import { 
  X, 
  Scale, 
  Utensils, 
  AlertTriangle, 
  Clock, 
  Film, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';


interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black text-white">
              {lang === 'zh-TW' ? '⚖️ BiteMap 免責聲明與使用條款' : '⚖️ 免責事項・利用規約'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed flex-1">
          {/* Metadata Block */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-950 flex items-center justify-between">
            <div>
              <span className="font-black text-sm block text-slate-900">BiteMap 短影音美食地圖</span>
              <span className="text-[11px] text-slate-500 font-bold">版本：v2.4.0 · 製作人：<strong className="text-rose-600">M.K(TW)</strong></span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[10px]">
              法律與版權聲明
            </span>
          </div>

          {/* Section 1: Subjective Reviews */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-slate-900">
              <Utensils className="w-4 h-4 text-rose-500" />
              <span>一、 美食評比與心得之主觀性聲明</span>
            </h3>
            <p>
              本平台所記錄之「必吃招牌」、「誠實避雷」、「私房筆記」及「評分星級」，均為<strong>製作人 M.K(TW)</strong> 及社群吃貨用戶之個人真實主觀用餐體驗與口感喜好。
              每個人對於鹹甜酸辣、油膩度及食材接受度皆有不同，心得僅供探索參考，不代表任何商業背書或品質擔保。
            </p>
          </div>

          {/* Section 2: Allergy & Health Warning */}
          <div className="space-y-1.5 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/70">
            <h3 className="font-black text-rose-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>二、 飲食過敏與忌口地雷守護提示</span>
            </h3>
            <p className="text-rose-950">
              本系統之「智能避雷守護盾」及「聚餐快選機」係依據用戶登記之忌口標籤進行演算法自動比對。<strong>此功能不具備醫療、營養診斷或過敏原保證之效力。</strong>
              若您或同行友人有嚴重食物過敏（如堅果、甲殼類海鮮、麩質、乳糖等），於現場點餐時<strong>請務必再次主動向餐廳服務人員確認食材成分與烹調器具</strong>。
            </p>
          </div>

          {/* Section 3: Operating Hours & Price */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>三、 店家資訊、營業時間與菜單售價變動</span>
            </h3>
            <p>
              各餐廳之公休日、營業時間、現場排隊訂位規則、菜單品項及售價可能因店家營運政策而隨時有所調整。造訪前建議點擊「Google Maps 導航」或參閱店家官方社群公告以獲取最新即時資訊。
            </p>
          </div>

          {/* Section 4: Video Copyright */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
              <Film className="w-4 h-4 text-purple-600" />
              <span>四、 短影音來源與社群媒體版權聲明</span>
            </h3>
            <p>
              本平台所嵌入之 Instagram Reels、YouTube Shorts 及 TikTok 短影音，皆完整保留創作者帳號、原影片網址與原生播放器框架，相關影音內容之智慧財產權與著作權均屬原創作者及原發布平台所有。本平台僅作個人探店紀錄與社群同好交流，無意侵害任何智慧財產權。原創作者若有撤除連結需求，請聯繫管理員。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            <span>感謝您的支持與理性探店 · 製作人 M.K(TW)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all active:scale-95 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>我已充分瞭解</span>
          </button>
        </div>
      </div>
    </div>
  );
};
