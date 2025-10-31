import React, { useState, useCallback, useEffect } from 'react';
import { getSimpleExplanation } from '../services/geminiService';
import type { PerformanceData } from '../types';
import { BrainIcon, SpeakerIcon, PauseIcon, PlayIcon } from './Icons';
import { Loader } from './Loader';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

// FIX: Define the missing props interface for the component.
interface GeminiExplanationProps {
  performanceData: PerformanceData;
  language: 'en' | 'hi';
}

export const GeminiExplanation: React.FC<GeminiExplanationProps> = React.memo(({ performanceData, language }) => {
  const [explanations, setExplanations] = useState<{ en: string | null; hi: string | null }>({ en: null, hi: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { togglePlayPause, playbackState, isLoading: isAudioLoading, stop } = useAudioPlayback();
  const explanation = explanations[language];

  // Reset explanation and stop speech when district or language changes
  useEffect(() => {
    stop();
    // Only reset text explanations if the district changes
    const districtId = performanceData.district.name;
    const memoizedReset = () => {
        setExplanations({ en: null, hi: null });
        setError(null);
    }
    memoizedReset();

  }, [performanceData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
        stop();
    };
  }, [stop]);


  const handleExplain = useCallback(async () => {
    if (explanations[language]) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSimpleExplanation(performanceData, language);
      setExplanations(prev => ({ ...prev, [language]: result }));
    } catch (err) {
      setError("Failed to get explanation.");
    } finally {
      setIsLoading(false);
    }
  }, [performanceData, language, explanations]);

  const handleToggleSpeech = useCallback(() => {
    if (explanation) {
      togglePlayPause(explanation);
    }
  }, [explanation, togglePlayPause]);
  
  const buttonText = {
    en: 'Explain in Simple Language',
    hi: 'आसान भाषा में समझें'
  };

  const thinkingText = {
    en: 'Thinking...',
    hi: 'सोच रहा है...'
  }

  const titleText = {
    en: 'Simple Explanation',
    hi: 'सरल स्पष्टीकरण'
  }

  const renderSpeakerIcon = () => {
    if (isAudioLoading) return <Loader />;
    if (playbackState === 'playing') return <PauseIcon className="h-6 w-6 text-yellow-900" />;
    if (playbackState === 'paused') return <PlayIcon className="h-6 w-6 text-yellow-900" />;
    return <SpeakerIcon className="h-6 w-6 text-yellow-900" />;
  }

  return (
    <div className="mt-6">
       <div className="bg-white p-4 rounded-lg shadow-md">
         <div className="flex justify-center items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-brand-dark-gray">{titleText[language]}</h3>
        </div>

        {!explanation && (
            <div className="flex justify-center">
                <button
                    onClick={handleExplain}
                    disabled={isLoading}
                    className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-brand-green text-white font-bold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label="Get a simple explanation of the data"
                >
                    <BrainIcon className="h-6 w-6 mr-2" />
                    {isLoading ? thinkingText[language] : buttonText[language]}
                </button>
            </div>
        )}
      
        {isLoading && <div className="mt-4 flex justify-center"><Loader /></div>}
        
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

        {explanation && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-brand-yellow text-yellow-800 p-4 rounded-r-lg shadow-md animate-fade-in relative">
                <button 
                    onClick={handleToggleSpeech}
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    aria-label={playbackState === 'playing' ? "Pause explanation" : "Play explanation aloud"}
                    disabled={isAudioLoading}
                >
                    {renderSpeakerIcon()}
                </button>
            <div className="whitespace-pre-wrap font-sans leading-relaxed pr-10">
                {explanation.split('\n').map((line, index) => {
                    const isListItem = line.trim().startsWith('*') || line.trim().startsWith('-');
                    const content = line.replace(/^[*-]\s*/, '');
                    return (
                        <div key={index} className={`flex items-start mb-2 ${isListItem ? 'ml-4' : ''}`}>
                        {isListItem && <span className="mr-2 mt-1">•</span>}
                        <p>{content}</p>
                        </div>
                    );
                })}
            </div>
            </div>
        )}
       </div>
    </div>
  );
});