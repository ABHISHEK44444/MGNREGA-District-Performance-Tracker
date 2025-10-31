import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, InfoIcon, SpeakerIcon, PauseIcon, PlayIcon } from './Icons';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { Loader } from './Loader';

interface DataCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  numericValue: number;
  unit: string;
  color: string;
  comparisonValue?: number;
  comparisonLabel?: string;
  onInfoClick?: () => void;
  language: 'en' | 'hi';
}

const Comparison: React.FC<{ numericValue: number; comparisonValue: number; label: string }> = ({ numericValue, comparisonValue, label }) => {
  const isBetter = numericValue >= comparisonValue;
  const difference = ((numericValue - comparisonValue) / comparisonValue) * 100;

  // Avoid showing comparison for identical values
  if (Math.abs(difference) < 0.1) {
    return (
        <p className="text-xs text-gray-500 mt-1">
            राज्य के औसत के बराबर (Same as state average)
        </p>
    );
  }

  const colorClass = isBetter ? 'text-green-600' : 'text-red-600';
  const Icon = isBetter ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={`flex items-center text-xs font-semibold mt-1 ${colorClass}`}>
      <Icon className="h-3 w-3 mr-1" />
      <span>{`${Math.abs(difference).toFixed(1)}%`} vs. {label}</span>
    </div>
  );
};


export const DataCard: React.FC<DataCardProps> = React.memo(({ icon, title, value, numericValue, unit, color, comparisonValue, comparisonLabel = 'State Avg', onInfoClick, language }) => {
  const { togglePlayPause, playbackState, isLoading } = useAudioPlayback();
  
  const handlePlayAudio = () => {
    let textToSpeak = language === 'en'
      ? `${title} is ${value} ${unit}.`
      : `${title}, ${value} ${unit}.`;

    if (comparisonValue !== undefined) {
        const isBetter = numericValue >= comparisonValue;
        const difference = Math.abs(((numericValue - comparisonValue) / comparisonValue) * 100);
        if (difference >= 0.1) {
            const comparisonText = isBetter 
                ? `${difference.toFixed(1)} percent higher than the state average.`
                : `${difference.toFixed(1)} percent lower than the state average.`;
            const hindiComparisonText = isBetter
                ? `राज्य के औसत से ${difference.toFixed(1)} प्रतिशत अधिक है।`
                : `राज्य के औसत से ${difference.toFixed(1)} प्रतिशत कम है।`;
            
            textToSpeak += language === 'en' ? ` This is ${comparisonText}` : ` यह ${hindiComparisonText}`;
        }
    }
    togglePlayPause(textToSpeak);
  };
  
  const renderSpeakerIcon = () => {
    if (isLoading) return <div className="h-5 w-5"><Loader /></div>;
    if (playbackState === 'playing') return <PauseIcon className="h-5 w-5 text-gray-600" />;
    if (playbackState === 'paused') return <PlayIcon className="h-5 w-5 text-gray-600" />;
    return <SpeakerIcon className="h-5 w-5 text-gray-400" />;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4 transition-transform transform hover:scale-105">
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-center gap-1">
                <button onClick={handlePlayAudio} className="-mt-1 p-1 rounded-full hover:bg-gray-200" aria-label={`Read ${title} aloud`}>
                    {renderSpeakerIcon()}
                </button>
                {onInfoClick && (
                    <button onClick={onInfoClick} className="-mt-1 p-1 rounded-full hover:bg-gray-200" aria-label={`Learn more about ${title}`}>
                        <InfoIcon className="h-4 w-4 text-gray-400"/>
                    </button>
                )}
            </div>
        </div>
        <p className="text-2xl font-bold text-brand-dark-gray">{value} <span className="text-lg font-medium">{unit}</span></p>
        {comparisonValue !== undefined && (
            <Comparison numericValue={numericValue} comparisonValue={comparisonValue} label={comparisonLabel} />
        )}
      </div>
    </div>
  );
});
