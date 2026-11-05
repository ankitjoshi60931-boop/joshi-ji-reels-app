import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Loader2, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscription?: (text: string) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onApplyTranscription,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMessage('');
    setTranscription('');
    audioChunksRef.current = [];
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioToGemini(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage(
        err?.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : 'Failed to access microphone. Please ensure an audio input device is connected.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToGemini = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage('');

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Data = (reader.result as string) || '';

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType,
            prompt: 'Transcribe this creator voice note accurately. Output clear punctuated sentences for video subtitles and social media reel caption. Support Hindi, Hinglish, and English seamlessly.',
          }),
        });

        const data = await res.json();
        if (data.success && data.text) {
          setTranscription(data.text);
        } else if (data.text === '') {
          setTranscription('No audible speech detected. Please speak louder and try again.');
        } else {
          throw new Error(data.error || 'Transcription failed');
        }
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err?.message || 'Failed to transcribe audio with Gemini 3.5 Transcribe.');
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Voice to Subtitles</h3>
              <p className="text-xs text-zinc-400">Powered by Gemini 3.5 Transcribe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recording Zone */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative mb-3">
            {isRecording && (
              <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-gradient-to-tr from-amber-500 to-rose-500 hover:opacity-90 text-black'
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8 text-black" />}
            </button>
          </div>

          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Recording... {formatTime(recordSeconds)}</span>
              </div>
            ) : isTranscribing ? (
              <div className="flex items-center space-x-2 text-amber-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transcribing with Gemini 3.5 Transcribe...</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-400">
                Tap the microphone to record your voiceover (Hindi / English)
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Output Section */}
        {transcription && (
          <div className="mb-4 bg-zinc-950 rounded-xl p-3 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Transcribed Text:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans max-h-36 overflow-y-auto no-scrollbar">
              {transcription}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800">
          {onApplyTranscription && transcription && (
            <button
              onClick={() => {
                onApplyTranscription(transcription);
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer"
            >
              Apply as Subtitles / Caption
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
