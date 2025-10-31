import React, { useState, useEffect, useCallback } from 'react';
import type { PerformanceData } from '../types';
import { Modal } from './Modal';
import { Loader } from './Loader';
import { TrendingUpIcon, SparklesIcon } from './Icons';
import { generateSuccessStory } from '../services/geminiService';

interface SuccessStoryGeneratorProps {
    performanceData: PerformanceData;
    language: 'en' | 'hi';
    onClose: () => void;
}

export const SuccessStoryGenerator: React.FC<SuccessStoryGeneratorProps> = ({ performanceData, language, onClose }) => {
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const uiStrings = {
        en: { 
            title: "Success Story", 
            description: "Inspiring stories from your district, powered by AI.", 
            generateButton: "Generate New Story", 
            generating: "Generating..." 
        },
        hi: { 
            title: "सफलता की कहानी", 
            description: "आपके जिले से प्रेरणादायक कहानियाँ, एआई द्वारा संचालित।", 
            generateButton: "नई कहानी उत्पन्न करें", 
            generating: "उत्पन्न हो रहा है..." 
        },
    };

    const fetchStory = useCallback(async () => {
        setIsLoading(true);
        setStory('');
        const result = await generateSuccessStory(performanceData, language);
        setStory(result);
        setIsLoading(false);
    }, [performanceData, language]);

    useEffect(() => {
        fetchStory();
    }, [fetchStory]);

    const currentStrings = uiStrings[language];

    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-rose-500 text-white rounded-lg p-3">
                            <TrendingUpIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-rose-600">{currentStrings.title}</h2>
                            <p className="text-sm text-gray-500">{currentStrings.description}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border min-h-[200px] flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center text-gray-500">
                            <Loader />
                            <p className="mt-2">{currentStrings.generating}</p>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap font-sans text-sm text-gray-800 animate-fade-in">{story}</p>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <button
                        onClick={fetchStory}
                        disabled={isLoading}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        {currentStrings.generateButton}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
