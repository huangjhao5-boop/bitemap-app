import React from 'react';
import type { ShortVideoSource } from '../../types';
import { parseVideoUrl } from '../../utils/videoParser';
import { ExternalLink, Sparkles } from 'lucide-react';

interface VideoEmbedProps {
  video: ShortVideoSource;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ video }) => {
  const info = parseVideoUrl(video.url);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-indigo-300 transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${info.badgeBg}`}>
            {info.displayLabel}
          </span>
          {video.creatorName && (
            <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
              @{video.creatorName}
            </span>
          )}
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 hover:underline"
        >
          <span>觀看影片</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {video.title && (
        <p className="text-xs text-slate-700 font-medium line-clamp-1 mb-2">
          {video.title}
        </p>
      )}

      {video.highlights && video.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {video.highlights.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
