import React, { useState, useMemo } from 'react';
import type { PerformanceData } from '../types';
import { PerformanceChart } from './PerformanceChart';
import { ChartBarIcon, TableIcon, SparklesIcon } from './Icons';
import { PerformanceTable } from './PerformanceTable';
import { getAIForecast } from '../services/geminiService';
import { Loader } from './Loader';

interface PerformanceChartsProps {
  performanceData: PerformanceData;
}

type Forecast = {
    forecastedValue: number;
    explanation: string;
} | null;

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ performanceData }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const { district: districtData, stateAverage } = performanceData;

  const [forecasts, setForecasts] = useState<{ [key: string]: Forecast }>({});
  const [isForecasting, setIsForecasting] = useState<{ [key: string]: boolean }>({});
  
  const combinedChartData = useMemo(() => {
    const baseData = districtData.data.map(d => {
      const avgForYear = stateAverage.find(avg => avg.year === d.year);
      return {
        ...d,
        stateAveragePersonDays: avgForYear?.personDaysGenerated,
        stateAverageHouseholds: avgForYear?.householdsProvidedEmployment,
      };
    });

    const nextYear = baseData.length > 0 ? baseData[baseData.length - 1].year + 1 : new Date().getFullYear();

    if (forecasts.personDaysGenerated) {
        // FIX: Add missing properties to the pushed object to match the type of other elements in `baseData`.
        baseData.push({
            year: nextYear,
            personDaysGenerated: forecasts.personDaysGenerated.forecastedValue,
            householdsProvidedEmployment: 0,
            averageDaysOfEmployment: 0,
            totalExpenditure: 0,
            stateAveragePersonDays: undefined,
            stateAverageHouseholds: undefined,
        });
    }
     if (forecasts.householdsProvidedEmployment) {
        const existingNextYear = baseData.find(d => d.year === nextYear);
        if (existingNextYear) {
            existingNextYear.householdsProvidedEmployment = forecasts.householdsProvidedEmployment.forecastedValue;
        } else {
            // FIX: Add missing properties to the pushed object to match the type of other elements in `baseData`.
             baseData.push({
                year: nextYear,
                personDaysGenerated: 0,
                householdsProvidedEmployment: forecasts.householdsProvidedEmployment.forecastedValue,
                averageDaysOfEmployment: 0,
                totalExpenditure: 0,
                stateAveragePersonDays: undefined,
                stateAverageHouseholds: undefined,
            });
        }
    }
    return baseData;

  }, [districtData.data, stateAverage, forecasts]);

  const handleForecast = async (metricKey: 'personDaysGenerated' | 'householdsProvidedEmployment', metricName: string) => {
    setIsForecasting(prev => ({ ...prev, [metricKey]: true }));
    const historicalData = districtData.data.map(d => ({ year: d.year, value: d[metricKey] }));
    
    try {
        const result = await getAIForecast(metricName, historicalData);
        if (result) {
            setForecasts(prev => ({ ...prev, [metricKey]: result }));
        }
    } catch (error) {
        console.error("Forecasting failed:", error);
        // Optionally set an error state here
    } finally {
        setIsForecasting(prev => ({ ...prev, [metricKey]: false }));
    }
  };

  const ForecastButton: React.FC<{ metricKey: 'personDaysGenerated' | 'householdsProvidedEmployment', metricName: string }> = ({ metricKey, metricName }) => (
    <div className="mt-2 text-center">
        {forecasts[metricKey] ? (
            <div className="text-sm p-2 bg-blue-50 text-brand-blue rounded-md">
                <strong>{districtData.data[districtData.data.length - 1].year + 1} Forecast:</strong> {forecasts[metricKey]?.explanation}
            </div>
        ) : (
            <button
                onClick={() => handleForecast(metricKey, metricName)}
                disabled={isForecasting[metricKey]}
                className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm bg-blue-100 text-brand-blue font-semibold rounded-full hover:bg-blue-200 transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
                {isForecasting[metricKey] ? (
                    <>
                        <Loader /> Forecasting...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="h-5 w-5" /> Forecast Next Year
                    </>
                )}
            </button>
        )}
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-brand-dark-gray">Year-on-Year Performance</h3>
        <div className="flex rounded-full bg-gray-200 p-1">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${viewMode === 'chart' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            aria-pressed={viewMode === 'chart'}
          >
            <ChartBarIcon className="h-5 w-5" /> Charts
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${viewMode === 'table' ? 'bg-brand-blue text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            aria-pressed={viewMode === 'table'}
          >
            <TableIcon className="h-5 w-5" /> Table
          </button>
        </div>
      </div>
      
      {viewMode === 'chart' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div>
            <PerformanceChart 
                data={combinedChartData} 
                dataKey="personDaysGenerated" 
                averageDataKey="stateAveragePersonDays"
                name="कुल काम के दिन (लाख में)"
                averageName="राज्य का औसत"
                fill="#16a34a"
                averageFill="#a7f3d0"
                forecastKey={forecasts.personDaysGenerated ? "personDaysGenerated" : undefined}
            />
            <ForecastButton metricKey="personDaysGenerated" metricName="Person-Days Generated" />
          </div>
          <div>
            <PerformanceChart 
                data={combinedChartData} 
                dataKey="householdsProvidedEmployment"
                averageDataKey="stateAverageHouseholds"
                name="रोजगार पाने वाले परिवार"
                averageName="राज्य का औसत"
                fill="#3b82f6"
                averageFill="#bfdbfe"
                forecastKey={forecasts.householdsProvidedEmployment ? "householdsProvidedEmployment" : undefined}
            />
            <ForecastButton metricKey="householdsProvidedEmployment" metricName="Households Provided Employment" />
          </div>
        </div>
      ) : (
        <PerformanceTable performanceData={performanceData} />
      )}
    </div>
  );
};
