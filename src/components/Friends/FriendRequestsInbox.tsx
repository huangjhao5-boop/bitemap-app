import React from 'react';
import type { FriendRequest } from '../../types';
import { 
  Check, 
  X, 
  Clock, 
} from 'lucide-react';


interface FriendRequestsInboxProps {
  requests: FriendRequest[];
  onAcceptRequest: (request: FriendRequest) => void;
  onDeclineRequest: (requestId: string) => void;
}

export const FriendRequestsInbox: React.FC<FriendRequestsInboxProps> = ({
  requests,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  if (pendingRequests.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-3.5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
            {pendingRequests.length}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              📬 待審核吃貨好友邀請 ({pendingRequests.length} 則新申請)
            </h3>
            <p className="text-[10px] text-slate-500">審核同意後，將自動匯入對方的真實口味與飲食忌口！</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 hover:border-amber-400 transition-all"
          >
            <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shadow-2xs overflow-hidden shrink-0">
                  {req.senderAvatar && (req.senderAvatar.startsWith('data:') || req.senderAvatar.startsWith('http') || req.senderAvatar.length > 20) ? (
                    <img src={req.senderAvatar} alt={req.senderName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{req.senderAvatar || '🥢'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-900 truncate">{req.senderName}</h4>
                  <p className="text-[10px] text-purple-700 font-mono font-bold truncate">@{req.senderFoodieId}</p>
                </div>
              </div>

              <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span>{req.sentAt}</span>
              </span>
            </div>

            {req.bio && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                "{req.bio}"
              </p>
            )}

            {/* Favorite & Dislikes */}
            <div className="space-y-1 text-[10px]">
              {(req.favoriteTags || []).length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-bold text-emerald-800 shrink-0">❤️ 愛吃：</span>
                  {(req.favoriteTags || []).map((tag, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(req.dislikedTags || []).length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-bold text-rose-800 shrink-0">⚠️ 忌口：</span>
                  {(req.dislikedTags || []).map((tag, i) => (
                    <span key={i} className="bg-rose-50 text-rose-800 px-1.5 py-0.2 rounded font-medium line-through">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons: Accept / Decline */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => onAcceptRequest(req)}
                className="py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>✅ 同意添加</span>
              </button>

              <button
                onClick={() => onDeclineRequest(req.id)}
                className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>婉拒</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
