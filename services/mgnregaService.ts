import { uttarPradeshData } from '../data/uttarPradeshData';
import type { DistrictData, PerformanceData, StateAverageData, YearlyData } from '../types';

export const getDistricts = async (): Promise<string[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return uttarPradeshData.map(d => d.name);
};

const calculateStateAverages = (): StateAverageData[] => {
    const yearlyTotals: { [year: number]: { count: number; households: number; personDays: number; avgDays: number; expenditure: number; } } = {};

    uttarPradeshData.forEach(district => {
        district.data.forEach(yearData => {
            if (!yearlyTotals[yearData.year]) {
                yearlyTotals[yearData.year] = { count: 0, households: 0, personDays: 0, avgDays: 0, expenditure: 0 };
            }
            const totals = yearlyTotals[yearData.year];
            totals.count++;
            totals.households += yearData.householdsProvidedEmployment;
            totals.personDays += yearData.personDaysGenerated;
            totals.avgDays += yearData.averageDaysOfEmployment;
            totals.expenditure += yearData.totalExpenditure;
        });
    });

    return Object.entries(yearlyTotals).map(([year, totals]) => ({
        year: parseInt(year, 10),
        householdsProvidedEmployment: totals.households / totals.count,
        personDaysGenerated: totals.personDays / totals.count,
        averageDaysOfEmployment: totals.avgDays / totals.count,
        totalExpenditure: totals.expenditure / totals.count,
    }));
};

export const getDistrictData = async (districtName: string): Promise<PerformanceData | undefined> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const district = uttarPradeshData.find(d => d.name === districtName);
  
  if (!district) {
    return undefined;
  }
  
  const stateAverage = calculateStateAverages();

  return { district, stateAverage };
};

export const getAllDistrictsLatestData = async (): Promise<{name: string, data: YearlyData}[]> => {
    // Simulate short delay
    await new Promise(resolve => setTimeout(resolve, 100)); 
    return uttarPradeshData.map(d => {
        // Assuming the last entry in the data array is the latest
        const latestData = d.data[d.data.length - 1];
        return {
            name: d.name,
            data: latestData
        };
    });
};