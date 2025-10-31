import React from 'react';
import type { PerformanceData } from '../types';

interface PerformanceTableProps {
  performanceData: PerformanceData;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({ performanceData }) => {
  const { district, stateAverage } = performanceData;

  const tableData = district.data.map(d => {
    const avgForYear = stateAverage.find(avg => avg.year === d.year);
    return {
      year: d.year,
      districtHouseholds: d.householdsProvidedEmployment,
      stateHouseholds: avgForYear?.householdsProvidedEmployment,
      districtPersonDays: d.personDaysGenerated,
      statePersonDays: avgForYear?.personDaysGenerated,
      districtAvgDays: d.averageDaysOfEmployment,
      stateAvgDays: avgForYear?.averageDaysOfEmployment,
      districtExpenditure: d.totalExpenditure,
      stateExpenditure: avgForYear?.totalExpenditure,
    };
  }).sort((a, b) => b.year - a.year); // show latest year first

  const formatNumber = (num: number | undefined) => num?.toLocaleString('en-IN') ?? 'N/A';
  const formatDecimal = (num: number | undefined) => num?.toFixed(2) ?? 'N/A';
  const formatRound = (num: number | undefined) => num ? Math.round(num).toLocaleString('en-IN') : 'N/A';

  return (
    <div className="overflow-x-auto animate-fade-in">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 sticky left-0 bg-gray-50 z-10 align-middle" rowSpan={2}>
              <div className="font-bold">Year</div>
              <div className="font-normal">वर्ष</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l" colSpan={2}>
              <div className="font-bold">Households Employed</div>
              <div className="font-normal">रोजगार पाने वाले परिवार</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l" colSpan={2}>
              <div className="font-bold">Person-Days (Lakh)</div>
              <div className="font-normal">कुल काम के दिन (लाख)</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l" colSpan={2}>
              <div className="font-bold">Avg. Days / Household</div>
              <div className="font-normal">प्रति परिवार औसत काम</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l" colSpan={2}>
              <div className="font-bold">Expenditure (₹ Cr)</div>
              <div className="font-normal">कुल खर्च (₹ करोड़)</div>
            </th>
          </tr>
          <tr>
            <th scope="col" className="px-4 py-3 text-center border-l bg-blue-50 font-semibold">{district.name}</th>
            <th scope="col" className="px-4 py-3 text-center bg-gray-100 font-semibold">
              <div className="font-bold">State Avg.</div>
              <div className="font-normal">राज्य का औसत</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l bg-green-50 font-semibold">{district.name}</th>
            <th scope="col" className="px-4 py-3 text-center bg-gray-100 font-semibold">
               <div className="font-bold">State Avg.</div>
               <div className="font-normal">राज्य का औसत</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l bg-yellow-50 font-semibold">{district.name}</th>
            <th scope="col" className="px-4 py-3 text-center bg-gray-100 font-semibold">
               <div className="font-bold">State Avg.</div>
               <div className="font-normal">राज्य का औसत</div>
            </th>
            <th scope="col" className="px-4 py-3 text-center border-l bg-red-50 font-semibold">{district.name}</th>
            <th scope="col" className="px-4 py-3 text-center bg-gray-100 font-semibold">
               <div className="font-bold">State Avg.</div>
               <div className="font-normal">राज्य का औसत</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.year} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
              <td className="px-4 py-4 font-medium text-gray-900 sticky left-0 bg-white z-10">{row.year}</td>
              <td className="px-4 py-4 text-center border-l">{formatNumber(row.districtHouseholds)}</td>
              <td className="px-4 py-4 text-center">{formatRound(row.stateHouseholds)}</td>
              <td className="px-4 py-4 text-center border-l">{formatNumber(row.districtPersonDays)}</td>
              <td className="px-4 py-4 text-center">{formatDecimal(row.statePersonDays)}</td>
              <td className="px-4 py-4 text-center border-l">{formatRound(row.districtAvgDays)}</td>
              <td className="px-4 py-4 text-center">{formatRound(row.stateAvgDays)}</td>
              <td className="px-4 py-4 text-center border-l">{formatNumber(row.districtExpenditure)}</td>
              <td className="px-4 py-4 text-center">{formatDecimal(row.stateExpenditure)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};