import React, { useState, useEffect } from 'react';
import { getAIInsight } from '../services/geminiService';
import type { YearlyData } from '../types';
import { LightbulbIcon } from './Icons';
import { Loader } from './Loader';

interface AIInsightProps {
  latestData: YearlyData;
  districtName: string;
  language: 'en' | 'hi';
}

export const AIInsight: React.FC<AIInsightProps> = ({ latestData, districtName, language }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      setInsight(null);
      const result = await getAIInsight(latestData, districtName, language);
      setInsight(result);
      setIsLoading(false);
    };

    if (latestData && districtName) {
        fetchInsight();
    }
  }, [latestData, districtName, language]);

  return (
    <div className="bg-blue-50 border-l-4 border-brand-blue text-brand-blue p-4 rounded-r-lg shadow-md mb-6 animate-fade-in">
      <div className="flex">
        <div className="py-1"><LightbulbIcon className="h-6 w-6 text-brand-blue mr-4"/></div>
        <div>
          <p className="font-bold">{language === 'en' ? 'AI Insight' : 'एआई इनसाइट'}</p>
          {isLoading && (
            <div className="flex items-center mt-1">
                <div className="w-5 h-5"><Loader /></div>
                <p className="text-sm ml-2">{language === 'en' ? 'Generating a fresh insight...' : 'एक नई जानकारी उत्पन्न हो रही है...'}</p>
            </div>
          )}
          {insight && !isLoading && (
            <p className="text-sm mt-1">{insight}</p>
          )}
          {!insight && !isLoading && (
             <p className="text-sm mt-1 text-gray-500">{language === 'en' ? 'Could not generate an insight at this time.' : 'इस समय कोई जानकारी उत्पन्न नहीं की जा सकी।'}</p>
          )}
        </div>
      </div>
    </div>
  );
};