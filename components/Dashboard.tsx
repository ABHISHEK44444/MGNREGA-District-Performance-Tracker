import React, { useState } from 'react';
import type { PerformanceData, YearlyData } from '../types';
import { GeminiExplanation } from './GeminiExplanation';
import { KeyMetrics } from './KeyMetrics';
import { PerformanceCharts } from './PerformanceCharts';
import { AIAnalyst } from './AIAnalyst';
import { DistrictComparison } from './DistrictComparison';
import { AIInsight } from './AIInsight';
import { GavelIcon, ShieldCheckIcon, LocationIcon, TrendingUpIcon } from './Icons';
import { GrievanceAssistant } from './GrievanceAssistant';
import { KnowYourRightsAssistant } from './KnowYourRightsAssistant';
import { WorksiteLocator } from './WorksiteLocator';
import { SuccessStoryGenerator } from './SuccessStoryGenerator';

interface DashboardProps {
  performanceData: PerformanceData;
  allDistrictsData: {name: string, data: YearlyData}[] | null;
  language: 'en' | 'hi';
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({ performanceData, allDistrictsData, language }) => {
  const { district: districtData } = performanceData;
  const latestData = districtData.data[districtData.data.length - 1];
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [isRightsModalOpen, setIsRightsModalOpen] = useState(false);
  const [isWorksiteModalOpen, setIsWorksiteModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  return (
    <>
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-brand-blue mb-4">{districtData.name} - {latestData.year} Performance</h2>
        
        <KeyMetrics 
          performanceData={performanceData} 
          language={language}
        />

        <AIInsight 
          latestData={latestData}
          districtName={districtData.name}
          language={language}
        />

        <PerformanceCharts performanceData={performanceData} />

        {allDistrictsData && (
          <DistrictComparison
              allDistrictsData={allDistrictsData}
              selectedDistrictName={districtData.name}
          />
        )}

        {/* Help Center Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {/* Know Your Rights Card */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full flex-grow">
                    <div className="flex items-center gap-4 text-left w-full">
                        <div className="bg-indigo-100 p-3 rounded-full flex-shrink-0">
                            <ShieldCheckIcon className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark-gray">{language === 'en' ? 'Know Your Rights' : 'अपने अधिकार जानें'}</h3>
                            <p className="text-sm text-gray-600">{language === 'en' ? 'Ask our AI about your rights under MGNREGA.' : 'मनरेगा के तहत अपने अधिकारों के बारे में हमारे एआई से पूछें।'}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsRightsModalOpen(true)}
                    className="w-full mt-4 sm:w-auto sm:self-end flex-shrink-0 px-6 py-2 bg-indigo-500 text-white font-bold rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                    {language === 'en' ? 'Ask Now' : 'अभी पूछें'}
                </button>
            </div>

            {/* Grievance Assistant Card */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full flex-grow">
                    <div className="flex items-center gap-4 text-left w-full">
                        <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                            <GavelIcon className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark-gray">{language === 'en' ? 'Need Help?' : 'सहायता चाहिए?'}</h3>
                            <p className="text-sm text-gray-600">{language === 'en' ? 'Use our AI assistant to draft a formal grievance letter.' : 'एक औपचारिक शिकायत पत्र का मसौदा तैयार करने के लिए हमारे एआई सहायक का उपयोग करें।'}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsGrievanceModalOpen(true)}
                    className="w-full mt-4 sm:w-auto sm:self-end flex-shrink-0 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105"
                >
                    {language === 'en' ? 'Draft Complaint' : 'शिकायत लिखें'}
                </button>
            </div>
            
            {/* Worksite Locator Card */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full flex-grow">
                    <div className="flex items-center gap-4 text-left w-full">
                        <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
                            <LocationIcon className="h-8 w-8 text-teal-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark-gray">{language === 'en' ? 'Worksite Locator' : 'कार्यस्थल लोकेटर'}</h3>
                            <p className="text-sm text-gray-600">{language === 'en' ? 'Find out about MGNREGA work happening in your area.' : 'अपने क्षेत्र में हो रहे मनरेगा के काम के बारे में पता करें।'}</p>
                        </div>
                    </div>
                </div>
                 <button
                    onClick={() => setIsWorksiteModalOpen(true)}
                    className="w-full mt-4 sm:w-auto sm:self-end flex-shrink-0 px-6 py-2 bg-teal-500 text-white font-bold rounded-full shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105"
                >
                    {language === 'en' ? 'Find Work' : 'काम खोजें'}
                </button>
            </div>

            {/* Success Story Card */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full flex-grow">
                    <div className="flex items-center gap-4 text-left w-full">
                        <div className="bg-rose-100 p-3 rounded-full flex-shrink-0">
                            <TrendingUpIcon className="h-8 w-8 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark-gray">{language === 'en' ? 'Success Stories' : 'सफलता की कहानियाँ'}</h3>
                            <p className="text-sm text-gray-600">{language === 'en' ? 'Read inspiring stories of progress from your district.' : 'अपने जिले से प्रगति की प्रेरणादायक कहानियाँ पढ़ें।'}</p>
                        </div>
                    </div>
                </div>
                 <button
                    onClick={() => setIsStoryModalOpen(true)}
                    className="w-full mt-4 sm:w-auto sm:self-end flex-shrink-0 px-6 py-2 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-transform transform hover:scale-105"
                >
                    {language === 'en' ? 'Read Story' : 'कहानी पढ़ें'}
                </button>
            </div>

        </div>

        <GeminiExplanation 
          performanceData={performanceData} 
          language={language}
        />

        <AIAnalyst 
          performanceData={performanceData} 
          language={language}
        />
      </div>

      {isGrievanceModalOpen && (
        <GrievanceAssistant
            performanceData={performanceData}
            language={language}
            onClose={() => setIsGrievanceModalOpen(false)}
        />
      )}

      {isRightsModalOpen && (
        <KnowYourRightsAssistant
            language={language}
            onClose={() => setIsRightsModalOpen(false)}
        />
      )}

      {isWorksiteModalOpen && (
        <WorksiteLocator
            district={districtData.name}
            language={language}
            onClose={() => setIsWorksiteModalOpen(false)}
        />
      )}

      {isStoryModalOpen && (
        <SuccessStoryGenerator
            performanceData={performanceData}
            language={language}
            onClose={() => setIsStoryModalOpen(false)}
        />
      )}
    </>
  );
});
