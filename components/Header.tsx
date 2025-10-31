import React from 'react';
import { DatabaseIcon } from './Icons';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onOpenResources: () => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenResources, language, setLanguage }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-12 w-12"/>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-blue">MGNREGA जिला प्रदर्शन</h1>
              <p className="text-sm md:text-base text-brand-dark-gray">District Performance Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <button
              onClick={onOpenResources}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
              aria-label="Open data resources"
            >
              <DatabaseIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Data Resources</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
