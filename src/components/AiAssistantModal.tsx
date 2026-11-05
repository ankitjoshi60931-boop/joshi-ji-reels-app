import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, Film, Loader2, ArrowRight, Zap, Target, Check } from 'lucide-react';
import { Reel, GeneratedScript, ReelAnalysis } from '../types.js';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReelForAudit?: Reel | null;
  onUseGeneratedScript?: (script: GeneratedScript) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedReelForAudit,
  onUseGeneratedScript,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'audit'>(
    selectedReelForAudit ? 'audit' : 'script'
  );

  // Script Generator State
  const [topic, setTopic] = useState('Top 3 AI Productivity Hacks for Developers');
  const [style, setStyle] = useState('High Energy & Educational');
  const [duration, setDuration] = useState('30-45 seconds');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);

  // Reel Audit State
  const [auditTitle, setAuditTitle] = useState(selectedReelForAudit?.title || 'VS Code Secrets in 5 Seconds');
  const [auditCaption, setAuditCaption] = useState(selectedReelForAudit?.caption || 'Secret shortcuts you must know!');
  const [isAuditing, setIsAuditing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReelAnalysis | null>(null);

  if (!isOpen) return null;

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingScript(true);
    setGeneratedScript(null);

    try {
      const res = await fetch('/api/ai/generate-reel-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, duration }),
      });
      const data = await res.json();
      if (data.success && data.script) {
        setGeneratedScript(data.script);
      }
    } catch (err) {
      console.error('Error generating script:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: auditTitle,
          caption: auditCaption,
          topic: 'Tech & Lifestyle',
          stats: selectedReelForAudit
            ? {
                views: selectedReelForAudit.likesCount * 4,
                likes: selectedReelForAudit.likesCount,
                comments: selectedReelForAudit.commentsCount,
                shares: selectedReelForAudit.sharesCount,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Error analyzing reel:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-black">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Joshi Ji AI Reel Studio</h2>
              <p className="text-xs text-zinc-400">Powered by Gemini 3.8 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
              activeTab === 'script'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Viral Script & Hook Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Algorithm & Reel Audit</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {activeTab === 'script' ? (
            <div>
              {/* Form */}
              <form onSubmit={handleGenerateScript} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Reel Topic or Concept:
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Best Chrome extensions for coders in 2026"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Tone & Style:</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="High Energy & Educational">High Energy & Educational</option>
                      <option value="Humorous & Relatable (Hindi/Hinglish)">Humorous & Relatable</option>
                      <option value="Storytelling & Inspiring">Storytelling & Inspiring</option>
                      <option value="Contrarian & Provocative">Contrarian & Provocative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Duration:</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                    >
                      <option value="15-30 seconds">15-30 seconds (Fast Viral)</option>
                      <option value="30-45 seconds">30-45 seconds (Standard)</option>
                      <option value="45-60 seconds">45-60 seconds (In-depth)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingScript || !topic.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Writing viral reel script with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate Viral Script & Hooks</span>
                    </>
                  )}
                </button>
              </form>

              {/* Generated Output */}
              {generatedScript && (
                <div className="mt-5 space-y-3.5 bg-zinc-950 p-4 rounded-xl border border-zinc-800 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <h3 className="font-bold text-sm text-amber-400">{generatedScript.title}</h3>
                    {onUseGeneratedScript && (
                      <button
                        onClick={() => {
                          onUseGeneratedScript(generatedScript);
                          onClose();
                        }}
                        className="flex items-center space-x-1 text-xs bg-amber-500 text-black font-semibold px-2.5 py-1 rounded-md hover:bg-amber-400 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use in Creator Studio</span>
                      </button>
                    )}
                  </div>

                  {/* Hooks */}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> 3 Opening Hooks (First 3s):
                    </h4>
                    <div className="space-y-1">
                      {generatedScript.hookOptions?.map((hook, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-2 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-200"
                        >
                          <span className="text-amber-400 font-bold mr-1">#{idx + 1}:</span> "{hook}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Beats */}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-rose-400" /> Beat-by-Beat Outline:
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                      {generatedScript.beats?.map((beat, idx) => (
                        <div key={idx} className="p-2 rounded bg-zinc-900 text-xs border border-zinc-800">
                          <div className="flex justify-between text-[11px] text-amber-300/80 mb-0.5">
                            <span className="font-semibold">{beat.timestamp}</span>
                            {beat.soundEffect && <span className="italic">{beat.soundEffect}</span>}
                          </div>
                          <p className="text-zinc-200"><span className="text-zinc-400 font-medium">Visual:</span> {beat.visual}</p>
                          <p className="text-white font-medium mt-0.5"><span className="text-amber-400 font-bold">Joshi Ji:</span> "{beat.voiceover}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags and CTA */}
                  <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-300 space-y-1">
                    <p><span className="text-zinc-400 font-semibold">CTA:</span> {generatedScript.callToAction}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generatedScript.hashtags?.map((t, i) => (
                        <span key={i} className="text-[11px] bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Audit Form */}
              <form onSubmit={handleRunAudit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Reel Title / Concept:</label>
                  <input
                    type="text"
                    value={auditTitle}
                    onChange={(e) => setAuditTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Caption & Hashtags:</label>
                  <textarea
                    rows={2}
                    value={auditCaption}
                    onChange={(e) => setAuditCaption(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuditing}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Auditing retention with Gemini 3.8 Flash...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 text-black" />
                      <span>Audit Reel Algorithm Performance</span>
                    </>
                  )}
                </button>
              </form>

              {/* Audit Results */}
              {analysisResult && (
                <div className="mt-5 space-y-3.5 bg-zinc-950 p-4 rounded-xl border border-zinc-800 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Engagement Score</span>
                      <div className="text-3xl font-extrabold text-amber-400 mt-1">
                        {analysisResult.engagementScore}/100
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Hook Rating</span>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        {analysisResult.hookRating}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-400" /> Retention Verdict:
                    </h4>
                    <p className="text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                      {analysisResult.retentionVerdict}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-rose-400" /> 3 Actionable Recommendations:
                    </h4>
                    <ul className="space-y-1.5">
                      {analysisResult.recommendations?.map((rec, i) => (
                        <li key={i} className="text-xs text-zinc-200 bg-zinc-900/90 p-2 rounded border-l-2 border-amber-500">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult.bestTimeToPost && (
                    <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800 flex justify-between">
                      <span>Best time to publish:</span>
                      <span className="text-amber-300 font-semibold">{analysisResult.bestTimeToPost}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
