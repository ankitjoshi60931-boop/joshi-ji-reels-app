export interface Subtitle {
  time: number;
  text: string;
}

export interface Creator {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: string;
  bio: string;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface Reel {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  audioTrack: string;
  creator: Creator;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  caption: string;
  tags: string[];
  subtitles: Subtitle[];
  category: 'tech' | 'coding' | 'ai' | 'lifestyle' | 'motivation';
  createdAt: string;
  comments: CommentItem[];
}

export interface ScriptBeat {
  timestamp: string;
  visual: string;
  voiceover: string;
  soundEffect?: string;
}

export interface GeneratedScript {
  title: string;
  hookOptions: string[];
  beats: ScriptBeat[];
  callToAction: string;
  suggestedCaption: string;
  hashtags: string[];
  musicVibe: string;
}

export interface ReelAnalysis {
  engagementScore: number;
  hookRating: string;
  strengths: string[];
  retentionVerdict: string;
  recommendations: string[];
  bestTimeToPost: string;
  viralPotential: string;
}
