import React, { useState } from 'react';
import type { PerformanceData } from '../types';
import { 
  DatabaseIcon, GridIcon, DiamondIcon, StarIcon, CsvIcon, PreviewIcon, InfoIcon, 
  DownloadIcon, ViewsIcon, ClockIcon, LinkIcon, FileTextIcon, NoteIcon, HashtagIcon 
} from './Icons';
import { Modal } from './Modal';
import { DataPreviewTable } from './DataPreviewTable';

const generateCSV = (data: PerformanceData): string => {
    const { district, stateAverage } = data;
    const headers = [
        "Year",
        `${district.name} - Households Provided Employment`,
        `State Average - Households Provided Employment`,
        `${district.name} - Person Days Generated (lakh)`,
        `State Average - Person Days Generated (lakh)`,
        `${district.name} - Average Days Of Employment`,
        `State Average - Average Days Of Employment`,
        `${district.name} - Total Expenditure (crore)`,
        `State Average - Total Expenditure (crore)`,
    ];

    const rows = district.data.map(d => {
        const avgForYear = stateAverage.find(avg => avg.year === d.year);
        return [
            d.year,
            d.householdsProvidedEmployment,
            avgForYear ? Math.round(avgForYear.householdsProvidedEmployment) : 'N/A',
            d.personDaysGenerated,
            avgForYear ? avgForYear.personDaysGenerated.toFixed(2) : 'N/A',
            d.averageDaysOfEmployment,
            avgForYear ? Math.round(avgForYear.averageDaysOfEmployment) : 'N/A',
            d.totalExpenditure,
            avgForYear ? avgForYear.totalExpenditure.toFixed(2) : 'N/A',
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<StarIcon key={i} className="w-5 h-5 text-yellow-400" />);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(
            <div key={i} className="relative">
                <StarIcon className="w-5 h-5 text-gray-300" />
                <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                </div>
            </div>
        );
    } else {
      stars.push(<StarIcon key={i} className="w-5 h-5 text-gray-300" />);
    }
  }
  return <div className="flex items-center">{stars}</div>;
};

const MetadataItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode;}> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-2 text-sm text-gray-600">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1">
      <span className="font-medium">{label}:</span>{' '}
      <span className="font-bold text-brand-dark-gray">{value}</span>
    </div>
  </div>
);

interface DataResourceCardProps {
    performanceData: PerformanceData | null;
    setSelectedDistrict: (district: string) => void;
    closeModal: () => void;
}

export const DataResourceCard: React.FC<DataResourceCardProps> = ({ performanceData, setSelectedDistrict, closeModal }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const handleActionClick = (action: string) => {
    if (action === 'Download') {
        if (performanceData) {
            const csvData = generateCSV(performanceData);
            downloadCSV(csvData, `MGNREGA_Data_${performanceData.district.name}.csv`);
        }
        return;
    }
    if (action === 'Preview') {
      if (performanceData) {
        setIsPreviewOpen(true);
      }
      return;
    }
  };

  const ActionButton: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void, disabled?: boolean }> = ({ icon, text, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-3 bg-white text-brand-blue font-semibold rounded-lg border-2 border-brand-blue shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
    >
      {icon}
      <span>{text}</span>
    </button>
  );

  return (
    <div className="p-4 sm:p-6 bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="bg-brand-blue text-white p-4 rounded-xl">
          <DatabaseIcon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brand-blue">Data Resources</h2>
          <p className="text-gray-600">Access the raw data for {performanceData ? performanceData.district.name : 'the selected district'}.</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Metadata Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-brand-dark-gray flex items-center gap-2">
            <InfoIcon className="w-6 h-6" />
            <span>API Metadata</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetadataItem icon={<FileTextIcon className="w-5 h-5 text-gray-500" />} label="Data Source" value="MGNREGA MIS Report" />
            <MetadataItem icon={<LinkIcon className="w-5 h-5 text-gray-500" />} label="Source Link" value={<a href="https://nrega.nic.in/" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">nrega.nic.in</a>} />
            <MetadataItem icon={<ClockIcon className="w-5 h-5 text-gray-500" />} label="Last Updated" value="2023" />
            <MetadataItem icon={<NoteIcon className="w-5 h-5 text-gray-500" />} label="Format" value="Illustrative Aggregates" />
            <MetadataItem icon={<HashtagIcon className="w-5 h-5 text-gray-500" />} label="Years Available" value="2021-2023" />
            <MetadataItem icon={<DiamondIcon className="w-5 h-5 text-gray-500" />} label="Quality Score" value={<div className="flex items-center gap-1"><StarRating rating={4.5} /> (4.5/5)</div>} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-brand-dark-gray mb-4 flex items-center gap-2">
                <GridIcon className="w-6 h-6" />
                <span>Available Actions</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <ActionButton 
                    icon={<DownloadIcon className="w-5 h-5" />}
                    text="Download CSV"
                    onClick={() => handleActionClick('Download')}
                    disabled={!performanceData}
                />
                <ActionButton 
                    icon={<PreviewIcon className="w-5 h-5" />}
                    text="Preview Data"
                    onClick={() => handleActionClick('Preview')}
                    disabled={!performanceData}
                />
            </div>
             {!performanceData && (
                <p className="text-sm text-gray-500 mt-3">Please select a district on the main page to enable these actions.</p>
            )}
        </div>
      </div>

      {isPreviewOpen && performanceData && (
        <Modal onClose={() => setIsPreviewOpen(false)}>
          <DataPreviewTable performanceData={performanceData} />
        </Modal>
      )}
    </div>
  );
};
