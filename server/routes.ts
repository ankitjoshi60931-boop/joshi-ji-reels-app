import { Router, Request, Response } from 'express';
import { Type } from '@google/genai';
import { ai } from './geminiClient.js';

export const apiRouter = Router();

// Health Check Endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'online',
    appName: 'Joshi Ji Reels API',
    geminiApiKeyConfigured: hasApiKey,
    timestamp: new Date().toISOString(),
    supportedModels: {
      transcription: 'gemini-3.5-transcribe',
      generalAI: 'gemini-3.8-flash',
      quickResponses: 'gemini-3.1-flash-lite',
    },
  });
});

/**
 * 1. Audio Transcription using gemini-3.5-transcribe
 * Accepts base64 encoded audio from microphone or audio file
 */
apiRouter.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', prompt } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid audioBase64 string. Please supply base64 audio data.',
      });
      return;
    }

    // Clean base64 string if data URL prefix was included
    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const instruction = prompt || 'Transcribe the spoken audio with high accuracy. Output clear punctuated sentences suitable for short-form video subtitles and reel captions. If Hindi or Hinglish or English is spoken, transcribe accurately in natural script/words.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: instruction },
        ],
      },
    });

    const transcriptionText = response.text || '';

    res.json({
      success: true,
      text: transcriptionText.trim(),
      mimeType,
    });
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio with Gemini.',
      details: error?.status || 'INTERNAL_ERROR',
    });
  }
});

// Helper function to execute Gemini requests with retry and resilient model fallback
async function generateWithFallback(options: {
  primaryModel: string;
  fallbackModel?: string;
  contents: any;
  config?: any;
}) {
  const { primaryModel, fallbackModel = 'gemini-3.1-flash-lite', contents, config } = options;

  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents,
      config,
    });
  } catch (err: any) {
    const errorStr = String(err?.message || err);
    console.warn(`[Gemini API] Primary model ${primaryModel} failed (${errorStr}), attempting fallback to ${fallbackModel}...`);
    
    // Retry once with fallback model
    return await ai.models.generateContent({
      model: fallbackModel,
      contents,
      config,
    });
  }
}

/**
 * 2. AI Reel Script & Viral Hook Generator using gemini-3.8-flash (with fallback)
 */
apiRouter.post('/ai/generate-reel-script', async (req: Request, res: Response) => {
  try {
    const {
      topic = 'Tech Productivity Hacks',
      style = 'High Energy & Actionable',
      targetAudience = 'Tech enthusiasts, creators, and students',
      duration = '30-45 seconds',
    } = req.body;

    const prompt = `Topic: "${topic}"
Style/Tone: "${style}"
Target Audience: "${targetAudience}"
Estimated Duration: "${duration}"

Generate a complete, high-converting short-form video reel package for Joshi Ji:
1. 3 Magnetic Hook variations for the first 3 seconds (curiosity gap, controversial statement, shocking stat).
2. Beat-by-beat voiceover script and on-screen visuals.
3. Call to Action (CTA).
4. Trending hashtags and catchy caption.`;

    const response = await generateWithFallback({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are the premier viral short-form scriptwriter and creative director for creator Joshi Ji. Produce high-impact, crisp, non-fluffy reel concepts that hook viewers immediately.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hookOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 punchy opening hooks for the first 3 seconds',
            },
            beats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: 'e.g. 0:00 - 0:03' },
                  visual: { type: Type.STRING, description: 'What appears on screen / camera action' },
                  voiceover: { type: Type.STRING, description: 'What Joshi Ji speaks' },
                  soundEffect: { type: Type.STRING, description: 'Audio cue or SFX' },
                },
              },
            },
            callToAction: { type: Type.STRING },
            suggestedCaption: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            musicVibe: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, script: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-reel-script:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate reel script.',
    });
  }
});

/**
 * 3. AI Reel Analyzer using gemini-3.8-flash
 */
apiRouter.post('/ai/analyze-reel', async (req: Request, res: Response) => {
  try {
    const { title, caption, topic, stats } = req.body;

    const prompt = `Analyze this Reel by Joshi Ji:
Title: "${title || 'Untitled Reel'}"
Caption: "${caption || ''}"
Topic: "${topic || 'General'}"
Metrics: ${JSON.stringify(stats || { views: 12500, likes: 1420, comments: 88, shares: 310 })}

Provide an algorithmic audit:
- Engagement Score out of 100
- Hook strength evaluation
- Viewer retention probability
- 3 specific, actionable recommendations to improve reach and comments`;

    const response = await generateWithFallback({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite short-form video algorithm engineer and creator consultant for Joshi Ji. Deliver analytical, realistic, and highly practical feedback.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            engagementScore: { type: Type.NUMBER },
            hookRating: { type: Type.STRING, description: 'e.g., A+, B, High Virality' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            retentionVerdict: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            bestTimeToPost: { type: Type.STRING },
            viralPotential: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-reel:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze reel.',
    });
  }
});

/**
 * 4. Smart Instant Replies for Comments using gemini-3.1-flash-lite
 */
apiRouter.post('/ai/smart-replies', async (req: Request, res: Response) => {
  try {
    const { reelCaption = '', commentText, tone = 'friendly' } = req.body;

    if (!commentText) {
      res.status(400).json({ error: 'commentText is required.' });
      return;
    }

    const prompt = `Reel Context: "${reelCaption}"
Fan Comment: "${commentText}"
Tone: "${tone}"

Provide 3 quick, natural, engaging comment replies from Joshi Ji.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are creator Joshi Ji replying to your fans and viewers. Keep responses concise, warm, authentic, and under 15 words each.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, replies: parsed.replies || [] });
  } catch (error: any) {
    console.error('Error in /api/ai/smart-replies:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate replies.',
    });
  }
});
