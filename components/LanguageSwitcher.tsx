import React from 'react';

interface LanguageSwitcherProps {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  return (
    <div className="flex rounded-full bg-gray-200 p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'hi' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
        aria-pressed={language === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
};
