import React, { useState } from 'react';
import { Modal } from './Modal';
import { InfoIcon } from './Icons';

type MetricContent = { title: string, definition: string, importance: string, interpretation: string };

interface MetricExplainerModalProps {
  content: { en: MetricContent, hi: MetricContent };
  initialLanguage: 'en' | 'hi';
  onClose: () => void;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-md font-semibold text-brand-dark-gray mb-1">{title}</h4>
    <p className="text-gray-600 text-sm leading-relaxed">{children}</p>
  </div>
);

export const MetricExplainerModal: React.FC<MetricExplainerModalProps> = ({
  content,
  initialLanguage,
  onClose,
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const currentContent = content[language];

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-brand-blue text-white rounded-lg p-3">
              <InfoIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-brand-blue">
                {language === 'en' ? 'Metric Explanation' : 'मीट्रिक स्पष्टीकरण'}
            </h2>
          </div>
          <div className="flex rounded-full bg-gray-200 p-1 self-end sm:self-center">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    English
                </button>
                <button
                    onClick={() => setLanguage('hi')}
                    className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'hi' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    हिन्दी
                </button>
            </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">{currentContent.title}</h3>
          <InfoSection title={language === 'en' ? "What it is" : "यह क्या है?"}>
            {currentContent.definition}
          </InfoSection>
          <InfoSection title={language === 'en' ? "Why it's important" : "यह महत्वपूर्ण क्यों है?"}>
            {currentContent.importance}
          </InfoSection>
          <InfoSection title={language === 'en' ? "How to interpret it" : "इसकी व्याख्या कैसे करें?"}>
            {currentContent.interpretation}
          </InfoSection>
        </div>
      </div>
    </Modal>
  );
};