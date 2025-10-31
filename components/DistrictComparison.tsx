import React, { useState, useMemo } from 'react';
import type { YearlyData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrophyIcon, DownloadIcon } from './Icons';

interface DistrictComparisonProps {
  allDistrictsData: {name: string, data: YearlyData}[];
  selectedDistrictName: string;
}

const metrics = [
    { key: 'averageDaysOfEmployment', label: 'Average Days of Employment', unit: 'Days' },
    { key: 'personDaysGenerated', label: 'Person-Days Generated', unit: 'Lakh' },
    { key: 'householdsProvidedEmployment', label: 'Households Employed', unit: 'Families' },
    { key: 'totalExpenditure', label: 'Total Expenditure', unit: '₹ Crore' },
];

const generateComparisonCSV = (data: {name: string, value: number}[], metricLabel: string, year: number): string => {
    const headers = [`Rank`, `District`, `${metricLabel} (${year})`];
    const rows = data.map((d, index) => [
        index + 1,
        `"${d.name.replace(/"/g, '""')}"`, // Handle names with quotes
        d.value
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
};

const downloadComparisonCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const DistrictComparison: React.FC<DistrictComparisonProps> = ({ allDistrictsData, selectedDistrictName }) => {
    const [selectedMetricKey, setSelectedMetricKey] = useState<keyof YearlyData>('averageDaysOfEmployment');

    const chartData = useMemo(() => {
        return allDistrictsData
            .map(d => ({
                name: d.name,
                value: d.data[selectedMetricKey] as number
            }))
            .sort((a, b) => b.value - a.value);
    }, [allDistrictsData, selectedMetricKey]);

    const selectedMetric = metrics.find(m => m.key === selectedMetricKey);
    
    const handleDownload = () => {
        if (!selectedMetric) return;
        const year = allDistrictsData[0].data.year;
        const csv = generateComparisonCSV(chartData, selectedMetric.label, year);
        downloadComparisonCSV(csv, `MGNREGA_Comparison_${selectedMetric.key}_${year}.csv`);
    };

    const yAxisTickFormatter = (name: string) => {
        const rank = chartData.findIndex(d => d.name === name) + 1;
        return `#${rank} ${name}`;
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-brand-dark-gray flex items-center gap-2">
                    <TrophyIcon className="h-6 w-6 text-brand-blue" />
                    State-wide District Comparison ({allDistrictsData[0].data.year})
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                        <select
                            value={selectedMetricKey}
                            onChange={(e) => setSelectedMetricKey(e.target.value as keyof YearlyData)}
                            className="block w-full sm:w-auto bg-gray-50 border border-gray-300 text-brand-dark-gray text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue p-2.5 pr-8 appearance-none"
                            aria-label="Select metric for comparison"
                        >
                            {metrics.map(metric => (
                                <option key={metric.key} value={metric.key}>{metric.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-green text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
                        aria-label="Download comparison data as CSV"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        <span className="whitespace-nowrap">Download CSV</span>
                    </button>
                </div>
            </div>

            <div style={{ width: '100%', height: allDistrictsData.length * 35 + 40 }}>
                <ResponsiveContainer>
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value as number)} />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120} 
                            tickFormatter={yAxisTickFormatter}
                            tick={{ fontSize: 12 }} 
                            interval={0}
                        />
                        <Tooltip
                            formatter={(value: number) => [value.toLocaleString('en-IN'), selectedMetric?.label]}
                        />
                        <Bar dataKey="value" name={selectedMetric?.label} background={{ fill: '#f3f4f6' }} radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.name === selectedDistrictName ? '#1e40af' : '#a5b4fc'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};