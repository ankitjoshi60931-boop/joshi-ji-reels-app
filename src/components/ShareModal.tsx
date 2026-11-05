import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Twitter, Send, Share2 } from 'lucide-react';
import { Reel } from '../types.js';

interface ShareModalProps {
  reel: Reel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ reel, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reel) return null;

  const reelUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: `Check out this reel by ${reel.creator.name}: ${reel.caption}`,
          url: reelUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Watch this Joshi Ji Reel: "${reel.title}"\n${reelUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`Check out this reel by Joshi Ji: "${reel.title}" #JoshiJi #TechReels`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(reelUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Share Reel</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reel Snippet */}
        <div className="my-4 flex items-center space-x-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
          <img
            src={reel.creator.avatar}
            alt={reel.creator.name}
            className="w-10 h-10 rounded-full object-cover border border-amber-400"
          />
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-white truncate">{reel.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">@{reel.creator.username}</p>
          </div>
        </div>

        {/* Share Channels */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors cursor-pointer border border-emerald-500/30"
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </button>
          <button
            onClick={handleTwitter}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 transition-colors cursor-pointer border border-sky-500/30"
          >
            <Twitter className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Twitter/X</span>
          </button>
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors cursor-pointer border border-purple-500/30"
          >
            <Send className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Native</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors cursor-pointer border border-amber-500/30"
          >
            {copied ? <Check className="w-5 h-5 mb-1 text-emerald-400" /> : <Copy className="w-5 h-5 mb-1" />}
            <span className="text-[10px] font-semibold">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <input
            type="text"
            readOnly
            value={reelUrl}
            className="flex-1 bg-transparent text-xs text-zinc-300 px-2 outline-hidden truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 cursor-pointer"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
