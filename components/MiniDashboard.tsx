import React from 'react';
import type { PerformanceData } from '../types';
import { KeyMetrics } from './KeyMetrics';
import { PerformanceCharts } from './PerformanceCharts';

// FIX: Add language prop to be passed to child components.
interface MiniDashboardProps {
  performanceData: PerformanceData;
  language: 'en' | 'hi';
}

export const MiniDashboard: React.FC<MiniDashboardProps> = ({ performanceData, language }) => {
  const { district: districtData } = performanceData;
  const latestData = districtData.data[districtData.data.length - 1];
  
  return (
    <div className="bg-slate-50 rounded-lg">
      <h3 className="text-xl font-bold text-brand-blue mb-4 text-center">
        {districtData.name} - {latestData.year} Snapshot
      </h3>
      <div className="transform scale-90 -m-4">
        <KeyMetrics performanceData={performanceData} language={language} />
        <PerformanceCharts performanceData={performanceData} />
      </div>
    </div>
  );
};