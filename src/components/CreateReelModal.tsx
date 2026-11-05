import React, { useState } from 'react';
import { X, Upload, Video, Mic, Sparkles, Plus, Check } from 'lucide-react';
import { Reel } from '../types.js';
import { JOSHI_JI_CREATOR } from '../data/initialReels.js';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishReel: (newReel: Reel) => void;
  onOpenTranscribe: () => void;
  initialCaption?: string;
  initialSubtitles?: string;
}

const TEMPLATE_VIDEOS = [
  {
    name: 'Coding & Screens',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31914-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hands Typing Keyboard',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41131-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Laptop & Coffee Setup',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-with-a-laptop-42991-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Creator Mobile Vlogging',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-recording-a-vlog-with-her-phone-41584-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Urban Cyber City',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-city-streets-with-neon-lights-at-night-41576-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
  },
];

export const CreateReelModal: React.FC<CreateReelModalProps> = ({
  isOpen,
  onClose,
  onPublishReel,
  onOpenTranscribe,
  initialCaption = '',
  initialSubtitles = '',
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState(initialCaption || '');
  const [tags, setTags] = useState('#JoshiJi #Tech #AI #Developer');
  const [selectedVideo, setSelectedVideo] = useState(TEMPLATE_VIDEOS[0].url);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [audioTrack, setAudioTrack] = useState('Original Audio • Joshi Ji Beats 🎵');
  const [subtitleText, setSubtitleText] = useState(initialSubtitles || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags
      .split(' ')
      .filter((t) => t.trim().length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const generatedSubtitles = subtitleText
      .split('.')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s, idx) => ({
        time: idx * 3.5,
        text: s,
      }));

    const newReel: Reel = {
      id: `reel-${Date.now()}`,
      title: title.trim(),
      videoUrl: customVideoUrl.trim() || selectedVideo,
      audioTrack: audioTrack.trim(),
      creator: JOSHI_JI_CREATOR,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      isSaved: false,
      caption: caption.trim() || title.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['#JoshiJi', '#Reels'],
      subtitles: generatedSubtitles.length > 0 ? generatedSubtitles : [{ time: 0, text: title.trim() }],
      category: 'tech',
      createdAt: 'Just now',
      comments: [],
    };

    onPublishReel(newReel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-black">
              <Plus className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-base">Create New Joshi Ji Reel</h2>
              <p className="text-xs text-zinc-400">Record, write captions & publish to feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* 1. Video Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select High-Quality Video Template:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TEMPLATE_VIDEOS.map((vid, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setSelectedVideo(vid.url);
                    setCustomVideoUrl('');
                  }}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-3/4 group cursor-pointer ${
                    selectedVideo === vid.url && !customVideoUrl
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={vid.thumbnail} alt={vid.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-black/80 text-[10px] text-center truncate">
                    {vid.name}
                  </div>
                  {selectedVideo === vid.url && !customVideoUrl && (
                    <div className="absolute top-1 right-1 bg-amber-500 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Video URL input */}
            <div className="mt-2.5">
              <input
                type="url"
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
                placeholder="Or paste custom MP4 video URL (optional)..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* 2. Reel Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Reel Title:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 AI Secrets Every Coder Must Know"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* 3. Caption & Voiceover Subtitles */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">Caption & Voiceover:</label>
              <button
                type="button"
                onClick={onOpenTranscribe}
                className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Transcribe Voice with AI</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write an engaging caption or record your voiceover..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* 4. Subtitles Overlay */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              On-Screen Subtitles (separated by period):
            </label>
            <input
              type="text"
              value={subtitleText}
              onChange={(e) => setSubtitleText(e.target.value)}
              placeholder="e.g. Welcome back coders. Today we automate our workflow. Hit follow!"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* 5. Hashtags and Audio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Hashtags:</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Audio Track:</label>
              <input
                type="text"
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer shadow-xl flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Publish Reel to Joshi Ji Feed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
