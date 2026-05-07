'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Mic, MicOff } from 'lucide-react';

interface VoiceSearchProps {
  onResult: (text: string) => void;
  language?: 'en' | 'ur';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

type VoiceState = 'idle' | 'listening' | 'processing';

function checkSupport(): boolean {
  if (typeof window === 'undefined') return false;
  const SR = (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  return !!SR;
}

export function VoiceSearch({
  onResult,
  language = 'en',
  className = '',
  size = 'md',
}: VoiceSearchProps) {
  const { t } = useLanguageStore();
  const [state, setState] = useState<VoiceState>('idle');
  const supported = checkSupport();
  const [error, setError] = useState('');
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  function createRecognition() {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setState('processing');
        setTimeout(() => {
          onResult(transcript);
          setState('idle');
        }, 300);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setError(t('voiceSearch.error'));
      } else if (event.error === 'not-allowed') {
        setError(t('voiceSearch.error'));
      } else {
        setError(t('voiceSearch.error'));
      }
      setState('idle');
      setTimeout(() => setError(''), 3000);
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
      }
    };

    return recognition;
  }

  const handleClick = useCallback(() => {
    if (!supported) return;
    if (state === 'listening') {
      recognitionRef.current?.stop();
      setState('idle');
      return;
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setError('');
    setState('listening');

    try {
      recognition.start();
    } catch {
      setState('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, state, language, t]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!supported) {
    return (
      <div className={`relative group ${className}`} title={t('voiceSearch.notSupported')}>
        <button
          className={`${sizeClasses[size]} rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 cursor-not-allowed transition-all opacity-50`}
          disabled
        >
          <MicOff className={iconSizes[size]} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all relative ${
          state === 'listening'
            ? 'bg-red-500/20 border-2 border-red-500/40 text-red-400 animate-pulse'
            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
        }`}
        aria-label={state === 'listening' ? t('voiceSearch.listening') : t('voiceSearch.tapToSpeak')}
      >
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500/10" />
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500/5" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        {state === 'processing' ? (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {/* Status text */}
      {state !== 'idle' && (
        <span className="text-[10px] text-white/40 font-medium whitespace-nowrap">
          {state === 'listening'
            ? t('voiceSearch.listening')
            : t('voiceSearch.processing')}
        </span>
      )}

      {/* Error */}
      {error && (
        <span className="text-[10px] text-red-400 font-medium whitespace-nowrap max-w-[120px] text-center leading-tight">
          {error}
        </span>
      )}
    </div>
  );
}
