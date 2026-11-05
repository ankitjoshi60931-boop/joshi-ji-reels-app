import React, { useState } from 'react';
import { X, CheckCircle, Video, Bookmark, Heart, BarChart3, Sparkles } from 'lucide-react';
import { Reel } from '../types.js';
import { JOSHI_JI_CREATOR } from '../data/initialReels.js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: Reel[];
  onSelectReel: (reelId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  reels,
  onSelectReel,
}) => {
  const [activeTab, setActiveTab] = useState<'reels' | 'saved' | 'liked' | 'analytics'>('reels');

  if (!isOpen) return null;

  const publishedReels = reels;
  const savedReels = reels.filter((r) => r.isSaved);
  const likedReels = reels.filter((r) => r.isLiked);

  const totalLikes = reels.reduce((acc, r) => acc + r.likesCount, 0);
  const totalComments = reels.reduce((acc, r) => acc + r.commentsCount, 0);
  const estimatedViews = totalLikes * 4.2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-base">@{JOSHI_JI_CREATOR.username}</span>
            <CheckCircle className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={JOSHI_JI_CREATOR.avatar}
                alt={JOSHI_JI_CREATOR.name}
                className="w-18 h-18 rounded-full object-cover border-2 border-amber-400 shadow-xl"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-amber-500 rounded-full border-2 border-zinc-900">
                <Sparkles className="w-3 h-3 text-black" />
              </span>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div>
                <div className="font-extrabold text-base text-white">{publishedReels.length}</div>
                <div className="text-[11px] text-zinc-400">Reels</div>
              </div>
              <div>
                <div className="font-extrabold text-base text-white">{JOSHI_JI_CREATOR.followers}</div>
                <div className="text-[11px] text-zinc-400">Followers</div>
              </div>
              <div>
                <div className="font-extrabold text-base text-white">
                  {(totalLikes / 1000).toFixed(1)}k
                </div>
                <div className="text-[11px] text-zinc-400">Likes</div>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{JOSHI_JI_CREATOR.name}</span>
              <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                Official Creator
              </span>
            </h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{JOSHI_JI_CREATOR.bio}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900">
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'reels'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Reels</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'saved'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedReels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'liked'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked ({likedReels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'analytics'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {activeTab === 'analytics' ? (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase">Estimated Views</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {(estimatedViews / 1000).toFixed(1)}k
                  </div>
                  <span className="text-[10px] text-emerald-400">+18% this week</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase">Engagement Rate</span>
                  <div className="text-xl font-bold text-rose-400 mt-1">8.9%</div>
                  <span className="text-[10px] text-emerald-400">High viral tier</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase">Total Comments</span>
                  <div className="text-xl font-bold text-purple-400 mt-1">{totalComments}</div>
                  <span className="text-[10px] text-zinc-400">Active audience</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase">AI Script Usage</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">94%</div>
                  <span className="text-[10px] text-amber-400">Gemini Powered</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                <span className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Joshi Ji Growth Tip:
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  Reels with synchronized voice subtitles (Gemini 3.5 Transcribe) achieve 2.4x higher completion rate. Use the microphone recorder for your next reel!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(activeTab === 'reels' ? publishedReels : activeTab === 'saved' ? savedReels : likedReels).map(
                (reel) => (
                  <button
                    key={reel.id}
                    onClick={() => {
                      onSelectReel(reel.id);
                      onClose();
                    }}
                    className="relative aspect-9/16 rounded-lg overflow-hidden border border-zinc-800 group cursor-pointer bg-zinc-950"
                  >
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5 text-left">
                      <span className="text-[10px] font-semibold text-white truncate">{reel.title}</span>
                      <div className="flex items-center space-x-1 text-[9px] text-amber-300">
                        <Heart className="w-2.5 h-2.5 fill-amber-300" />
                        <span>{reel.likesCount >= 1000 ? `${(reel.likesCount / 1000).toFixed(0)}k` : reel.likesCount}</span>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
