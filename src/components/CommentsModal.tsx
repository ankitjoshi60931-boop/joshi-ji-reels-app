import React, { useState } from 'react';
import { X, Send, Heart, Sparkles, Loader2 } from 'lucide-react';
import { Reel, CommentItem } from '../types.js';

interface CommentsModalProps {
  reel: Reel;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (reelId: string, comment: CommentItem) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  reel,
  isOpen,
  onClose,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [activeCommentIdForAi, setActiveCommentIdForAi] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: commentText.trim(),
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
    };

    onAddComment(reel.id, newComment);
    setCommentText('');
    setSmartReplies([]);
    setActiveCommentIdForAi(null);
  };

  // Request smart replies for a specific fan comment
  const handleGenerateSmartReply = async (comment: CommentItem) => {
    setActiveCommentIdForAi(comment.id);
    setIsGeneratingReplies(true);
    setSmartReplies([]);

    try {
      const res = await fetch('/api/ai/smart-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelCaption: reel.caption,
          commentText: comment.text,
          tone: 'friendly',
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.replies)) {
        setSmartReplies(data.replies);
      }
    } catch (err) {
      console.error('Error generating smart reply:', err);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-base">Comments</span>
            <span className="text-zinc-400 text-sm">({reel.comments.length})</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {reel.comments.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            reel.comments.map((c) => (
              <div key={c.id} className="flex space-x-3 items-start group">
                <img
                  src={c.avatar}
                  alt={c.author}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-700 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-white">{c.author}</span>
                    <span className="text-[11px] text-zinc-400">{c.timeAgo}</span>
                  </div>
                  <p className="text-sm text-zinc-200 mt-0.5 leading-snug">{c.text}</p>

                  {/* AI Quick Reply Trigger Button for Joshi Ji */}
                  <div className="flex items-center space-x-3 mt-1.5 text-xs text-zinc-400">
                    <button
                      onClick={() => handleGenerateSmartReply(c)}
                      className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Smart Reply</span>
                    </button>
                  </div>

                  {/* Smart Reply Suggestions */}
                  {activeCommentIdForAi === c.id && (
                    <div className="mt-2 p-2.5 rounded-lg bg-zinc-800/80 border border-amber-500/30 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-amber-300 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Suggested replies for Joshi Ji:
                        </span>
                        {isGeneratingReplies && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                      </div>
                      {smartReplies.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          {smartReplies.map((reply, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setCommentText(`@${c.author} ${reply}`);
                              }}
                              className="text-left px-2 py-1.5 rounded bg-zinc-700/80 hover:bg-amber-600/30 text-zinc-200 hover:text-amber-200 text-xs transition-colors cursor-pointer border border-zinc-600/50"
                            >
                              "{reply}"
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Likes */}
                <div className="flex flex-col items-center pt-1 text-zinc-400 hover:text-rose-400 cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">{c.likes}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment as Joshi Ji or fan..."
            className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 text-sm px-3.5 py-2.5 rounded-full outline-hidden focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            aria-label="Post comment"
            className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
