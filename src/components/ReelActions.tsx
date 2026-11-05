import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles } from 'lucide-react';
import { Reel } from '../types.js';

interface ReelActionsProps {
  reel: Reel;
  onLikeToggle: (id: string) => void;
  onSaveToggle: (id: string) => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onOpenAiAudit: (reel: Reel) => void;
}

export const ReelActions: React.FC<ReelActionsProps> = ({
  reel,
  onLikeToggle,
  onSaveToggle,
  onOpenComments,
  onOpenShare,
  onOpenAiAudit,
}) => {
  return (
    <div className="absolute right-2 bottom-16 sm:bottom-12 z-30 flex flex-col items-center space-y-4 select-none">
      {/* 1. Like Action */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onLikeToggle(reel.id)}
          aria-label="Like reel"
          className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/60 transition-transform active:scale-75 cursor-pointer shadow-lg"
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              reel.isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white'
            }`}
          />
        </button>
        <span className="text-white text-xs font-semibold mt-1 drop-shadow">
          {reel.likesCount >= 1000
            ? `${(reel.likesCount / 1000).toFixed(1)}k`
            : reel.likesCount}
        </span>
      </div>

      {/* 2. Comments Action */}
      <div className="flex flex-col items-center">
        <button
          onClick={onOpenComments}
          aria-label="Open comments"
          className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/60 transition-transform active:scale-75 cursor-pointer shadow-lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
        <span className="text-white text-xs font-semibold mt-1 drop-shadow">
          {reel.commentsCount}
        </span>
      </div>

      {/* 3. Bookmark / Save Action */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSaveToggle(reel.id)}
          aria-label="Save reel"
          className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/60 transition-transform active:scale-75 cursor-pointer shadow-lg"
        >
          <Bookmark
            className={`w-6 h-6 transition-colors ${
              reel.isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'
            }`}
          />
        </button>
        <span className="text-white text-xs font-medium mt-1 drop-shadow">Save</span>
      </div>

      {/* 4. Share Action */}
      <div className="flex flex-col items-center">
        <button
          onClick={onOpenShare}
          aria-label="Share reel"
          className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/60 transition-transform active:scale-75 cursor-pointer shadow-lg"
        >
          <Share2 className="w-6 h-6 text-white" />
        </button>
        <span className="text-white text-xs font-medium mt-1 drop-shadow">Share</span>
      </div>

      {/* 5. AI Reel Auditor Quick Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onOpenAiAudit(reel)}
          title="Analyze with Gemini AI"
          aria-label="AI Reel Analysis"
          className="p-2.5 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white hover:opacity-90 transition-transform active:scale-75 cursor-pointer shadow-lg border border-white/20 animate-pulse"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        <span className="text-[10px] text-amber-300 font-bold mt-1 drop-shadow">AI Audit</span>
      </div>

      {/* 6. Rotating Vinyl Disc */}
      <div className="pt-1">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-700 bg-zinc-900 p-1 flex items-center justify-center animate-spin-slow shadow-2xl">
          <img
            src={reel.creator.avatar}
            alt="Audio cover"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
