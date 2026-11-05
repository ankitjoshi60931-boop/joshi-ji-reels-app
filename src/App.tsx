/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  PlusSquare, 
  User, 
  Flame, 
  ChevronUp, 
  ChevronDown, 
  Smartphone,
  Video
} from 'lucide-react';
import { Reel, CommentItem, GeneratedScript } from './types.js';
import { INITIAL_REELS, JOSHI_JI_CREATOR } from './data/initialReels.js';
import { ReelPlayer } from './components/ReelPlayer.js';
import { ReelActions } from './components/ReelActions.js';
import { CommentsModal } from './components/CommentsModal.js';
import { AudioTranscribeModal } from './components/AudioTranscribeModal.js';
import { AiAssistantModal } from './components/AiAssistantModal.js';
import { CreateReelModal } from './components/CreateReelModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { ShareModal } from './components/ShareModal.js';

export default function App() {
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'coding' | 'tech' | 'motivation'>('all');
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Modals state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isTranscribeOpen, setIsTranscribeOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [selectedReelForAudit, setSelectedReelForAudit] = useState<Reel | null>(null);
  const [initialCaptionForCreate, setInitialCaptionForCreate] = useState('');
  const [initialSubtitlesForCreate, setInitialSubtitlesForCreate] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter reels
  const filteredReels = activeCategory === 'all'
    ? reels
    : reels.filter((r) => r.category === activeCategory);

  const currentReel = filteredReels[activeReelIndex] || filteredReels[0] || reels[0];

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        scrollToReel(Math.min(activeReelIndex + 1, filteredReels.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        scrollToReel(Math.max(activeReelIndex - 1, 0));
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, filteredReels.length]);

  // Scroll to index
  const scrollToReel = (index: number) => {
    if (index < 0 || index >= filteredReels.length) return;
    setActiveReelIndex(index);
    const container = containerRef.current;
    if (container) {
      const targetElement = container.children[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Scroll observer to update active reel index on snap
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < filteredReels.length) {
      setActiveReelIndex(newIndex);
    }
  };

  // Like toggle
  const handleLikeToggle = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const nextLiked = !r.isLiked;
          return {
            ...r,
            isLiked: nextLiked,
            likesCount: nextLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  // Save toggle
  const handleSaveToggle = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, isSaved: !r.isSaved } : r))
    );
  };

  // Add comment
  const handleAddComment = (reelId: string, comment: CommentItem) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [comment, ...r.comments],
          };
        }
        return r;
      })
    );
  };

  // Add new published reel
  const handlePublishReel = (newReel: Reel) => {
    setReels((prev) => [newReel, ...prev]);
    setActiveReelIndex(0);
    scrollToReel(0);
  };

  // Use AI Script in Creator Studio
  const handleUseGeneratedScript = (script: GeneratedScript) => {
    setInitialCaptionForCreate(
      `${script.hookOptions[0] || ''}\n\n${script.suggestedCaption || ''}\n\n${script.hashtags.join(' ')}`
    );
    const voiceoverCombined = script.beats.map((b) => b.voiceover).join('. ');
    setInitialSubtitlesForCreate(voiceoverCombined);
    setIsCreateOpen(true);
  };

  // Apply audio transcription to Creator Studio
  const handleApplyTranscription = (text: string) => {
    setInitialSubtitlesForCreate(text);
    setInitialCaptionForCreate((prev) => (prev ? `${prev}\n\n${text}` : text));
    setIsCreateOpen(true);
  };

  // Open AI audit for a specific reel
  const handleOpenAiAudit = (reel: Reel) => {
    setSelectedReelForAudit(reel);
    setIsAiAssistantOpen(true);
  };

  return (
    <div className="relative w-screen h-screen bg-black flex flex-col overflow-hidden text-white font-sans select-none">
      {/* 1. Top Global Navigation Header */}
      <header className="absolute top-0 inset-x-0 z-40 h-14 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between px-3 sm:px-6 backdrop-blur-xs">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
              Joshi Ji Reels
            </span>
          </div>
        </div>

        {/* Filter Categories (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center space-x-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs font-semibold">
          <button
            onClick={() => { setActiveCategory('all'); setActiveReelIndex(0); }}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              activeCategory === 'all' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            All Reels
          </button>
          <button
            onClick={() => { setActiveCategory('ai'); setActiveReelIndex(0); }}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              activeCategory === 'ai' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            AI Tools
          </button>
          <button
            onClick={() => { setActiveCategory('coding'); setActiveReelIndex(0); }}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              activeCategory === 'coding' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Coding
          </button>
          <button
            onClick={() => { setActiveCategory('motivation'); setActiveReelIndex(0); }}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              activeCategory === 'motivation' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Motivation
          </button>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center space-x-2">
          {/* AI Transcribe Mic */}
          <button
            onClick={() => setIsTranscribeOpen(true)}
            title="Transcribe Voice with Gemini 3.5"
            className="flex items-center space-x-1 text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 px-2.5 py-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Transcribe</span>
          </button>

          {/* AI Script & Studio */}
          <button
            onClick={() => {
              setSelectedReelForAudit(null);
              setIsAiAssistantOpen(true);
            }}
            title="Gemini AI Studio"
            className="flex items-center space-x-1 text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">AI Studio</span>
          </button>

          {/* Upload Reel */}
          <button
            onClick={() => setIsCreateOpen(true)}
            title="Create / Upload Reel"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold text-xs flex items-center space-x-1 hover:opacity-95 transition-opacity cursor-pointer shadow-md"
          >
            <PlusSquare className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            title="Joshi Ji Profile"
            className="relative cursor-pointer group"
          >
            <img
              src={JOSHI_JI_CREATOR.avatar}
              alt={JOSHI_JI_CREATOR.name}
              className="w-8 h-8 rounded-full object-cover border border-amber-400 group-hover:scale-105 transition-transform"
            />
          </button>
        </div>
      </header>

      {/* 2. Main Vertical Reels Container */}
      <main className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {/* Desktop Reel Frame (Phone aspect on wide screens, full bleed on mobile) */}
        <div className="relative w-full h-full sm:max-w-[420px] sm:max-h-[92vh] sm:rounded-3xl sm:border sm:border-zinc-800 overflow-hidden shadow-2xl bg-black">
          {/* Snap-scroll list */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
          >
            {filteredReels.map((reel, index) => (
              <div
                key={reel.id}
                className="w-full h-full snap-start snap-always relative flex-shrink-0"
              >
                <ReelPlayer
                  reel={reel}
                  isActive={index === activeReelIndex}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onLikeToggle={handleLikeToggle}
                  onOpenProfile={() => setIsProfileOpen(true)}
                />
                <ReelActions
                  reel={reel}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleSaveToggle}
                  onOpenComments={() => setIsCommentsOpen(true)}
                  onOpenShare={() => setIsShareOpen(true)}
                  onOpenAiAudit={handleOpenAiAudit}
                />
              </div>
            ))}
          </div>

          {/* Up/Down Desktop Navigation Arrows */}
          <div className="hidden lg:flex absolute -right-14 top-1/2 -translate-y-1/2 flex-col space-y-2 pointer-events-auto">
            <button
              onClick={() => scrollToReel(activeReelIndex - 1)}
              disabled={activeReelIndex === 0}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white disabled:opacity-30 border border-zinc-700 cursor-pointer shadow-lg"
              title="Previous Reel (Arrow Up)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToReel(activeReelIndex + 1)}
              disabled={activeReelIndex === filteredReels.length - 1}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white disabled:opacity-30 border border-zinc-700 cursor-pointer shadow-lg"
              title="Next Reel (Arrow Down)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. Mobile Navigation Bottom Bar (Android APK feel) */}
      <nav className="sm:hidden absolute bottom-0 inset-x-0 h-13 bg-zinc-950/95 border-t border-zinc-800 flex items-center justify-around z-40 backdrop-blur-md">
        <button
          onClick={() => { setActiveCategory('all'); setActiveReelIndex(0); }}
          className="flex flex-col items-center text-amber-400 cursor-pointer"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-semibold">Feed</span>
        </button>

        <button
          onClick={() => setIsTranscribeOpen(true)}
          className="flex flex-col items-center text-zinc-400 hover:text-white cursor-pointer"
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Transcribe</span>
        </button>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-black shadow-lg cursor-pointer transform -translate-y-2"
        >
          <PlusSquare className="w-5 h-5 text-black" />
        </button>

        <button
          onClick={() => {
            setSelectedReelForAudit(null);
            setIsAiAssistantOpen(true);
          }}
          className="flex flex-col items-center text-zinc-400 hover:text-white cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">AI Tools</span>
        </button>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex flex-col items-center text-zinc-400 hover:text-white cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </nav>

      {/* 4. Interactive Modals */}
      {currentReel && (
        <>
          <CommentsModal
            reel={currentReel}
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            onAddComment={handleAddComment}
          />
          <ShareModal
            reel={currentReel}
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
          />
        </>
      )}

      <AudioTranscribeModal
        isOpen={isTranscribeOpen}
        onClose={() => setIsTranscribeOpen(false)}
        onApplyTranscription={handleApplyTranscription}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => {
          setIsAiAssistantOpen(false);
          setSelectedReelForAudit(null);
        }}
        selectedReelForAudit={selectedReelForAudit}
        onUseGeneratedScript={handleUseGeneratedScript}
      />

      <CreateReelModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setInitialCaptionForCreate('');
          setInitialSubtitlesForCreate('');
        }}
        onPublishReel={handlePublishReel}
        onOpenTranscribe={() => setIsTranscribeOpen(true)}
        initialCaption={initialCaptionForCreate}
        initialSubtitles={initialSubtitlesForCreate}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        reels={reels}
        onSelectReel={(id) => {
          const idx = filteredReels.findIndex((r) => r.id === id);
          if (idx !== -1) {
            scrollToReel(idx);
          }
        }}
      />
    </div>
  );
}
