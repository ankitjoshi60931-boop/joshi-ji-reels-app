import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Music, CheckCircle } from 'lucide-react';
import { Reel } from '../types.js';

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLikeToggle: (id: string) => void;
  onOpenProfile: () => void;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onLikeToggle,
  onOpenProfile,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapTimeRef = useRef<number>(0);

  // Play/pause based on active reel in feed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio was blocked, mute and retry
            video.muted = true;
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Track progress and subtitles
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const current = video.currentTime;
    const dur = video.duration;
    setProgress((current / dur) * 100);

    // Find active subtitle
    if (reel.subtitles && reel.subtitles.length > 0) {
      const match = reel.subtitles
        .slice()
        .reverse()
        .find((sub) => current >= sub.time);

      if (match) {
        setActiveSubtitle(match.text);
      } else {
        setActiveSubtitle('');
      }
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  };

  // Double tap to like
  const handleVideoTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const heartId = now;
      setHearts((prev) => [...prev, { id: heartId, x, y }]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 800);

      if (!reel.isLiked) {
        onLikeToggle(reel.id);
      }
    } else {
      togglePlay();
    }
    lastTapTimeRef.current = now;
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        preload="auto"
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoTap}
      />

      {/* Heart Burst on Double Tap */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2 animate-float-heart"
          style={{ left: heart.x, top: heart.y }}
        >
          <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
        </div>
      ))}

      {/* Play/Pause Central Flash Icon */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity">
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white scale-125 transition-transform animate-pulse">
            {isPlaying ? <Play className="w-10 h-10 fill-white" /> : <Pause className="w-10 h-10 fill-white" />}
          </div>
        </div>
      )}

      {/* Floating Subtitle Overlay */}
      {activeSubtitle && (
        <div className="absolute bottom-28 left-4 right-20 z-20 pointer-events-none flex justify-center">
          <div className="bg-black/75 backdrop-blur-md text-yellow-300 font-bold px-3 py-1.5 rounded-lg text-sm sm:text-base border border-yellow-400/30 shadow-lg text-center leading-snug">
            {activeSubtitle}
          </div>
        </div>
      )}

      {/* Sound Mute/Unmute Quick Button (Top-Right) */}
      <button
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all shadow-md active:scale-90"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
      </button>

      {/* Bottom Creator & Caption Overlay */}
      <div className="absolute bottom-4 left-0 right-16 px-4 z-20 text-white pointer-events-auto">
        {/* Creator Info */}
        <div className="flex items-center space-x-2.5 mb-2">
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 text-left group"
          >
            <div className="relative">
              <img
                src={reel.creator.avatar}
                alt={reel.creator.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5">
                <CheckCircle className="w-3 h-3 text-black fill-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-sm drop-shadow">{reel.creator.name}</span>
                <span className="text-xs text-amber-300 font-medium bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                  Creator
                </span>
              </div>
              <span className="text-xs text-zinc-300 drop-shadow">@{reel.creator.username}</span>
            </div>
          </button>
        </div>

        {/* Reel Title & Caption */}
        <div className="mb-2.5">
          <p className="text-xs sm:text-sm font-medium text-white/95 leading-relaxed drop-shadow">
            {isExpandedCaption ? reel.caption : `${reel.caption.slice(0, 85)}${reel.caption.length > 85 ? '...' : ''}`}
            {reel.caption.length > 85 && (
              <button
                onClick={() => setIsExpandedCaption(!isExpandedCaption)}
                className="ml-1 text-zinc-300 hover:text-white font-semibold text-xs underline cursor-pointer"
              >
                {isExpandedCaption ? 'less' : 'more'}
              </button>
            )}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {reel.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] text-amber-300/90 font-medium bg-white/10 px-1.5 py-0.5 rounded backdrop-blur-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Track Ticker */}
        <div className="flex items-center space-x-2 text-xs text-zinc-200">
          <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="truncate max-w-[200px] sm:max-w-xs">{reel.audioTrack}</span>
        </div>
      </div>

      {/* Progress Bar (Bottom edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
