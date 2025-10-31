import React from 'react';
import type { PerformanceData } from '../types';

interface DataPreviewTableProps {
    performanceData: PerformanceData | null;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ performanceData }) => {
    if (!performanceData) {
        return (
            <div className="p-4 sm:p-6 bg-white text-center">
                <h3 className="text-xl font-bold text-brand-blue mb-4">Data Preview</h3>
                <p className="text-gray-600">Please select a district to preview its data.</p>
            </div>
        );
    }

    const { district } = performanceData;
    const tableData = district.data.map(d => ({
        year: d.year,
        households: d.householdsProvidedEmployment.toLocaleString('en-IN'),
        personDays: `${d.personDaysGenerated.toLocaleString('en-IN')} Lakh`,
        expenditure: `₹${d.totalExpenditure.toLocaleString('en-IN')} Cr`,
    })).sort((a, b) => b.year - a.year);

    return (
        <div className="p-4 sm:p-6 bg-white">
            <h3 className="text-xl font-bold text-brand-blue mb-4">Data Preview for {district.name}</h3>
            <p className="text-sm text-gray-600 mb-4">This is a preview of the selected district's data. The full dataset with state comparisons can be downloaded as a CSV.</p>
            <div className="overflow-x-auto rounded-lg border max-h-96">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Year</th>
                            <th scope="col" className="px-6 py-3">Households Employed</th>
                            <th scope="col" className="px-6 py-3">Person-Days Generated</th>
                            <th scope="col" className="px-6 py-3">Total Expenditure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row) => (
                            <tr key={row.year} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
                                <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {row.year}
                                </td>
                                <td className="px-6 py-4">{row.households}</td>
                                <td className="px-6 py-4">{row.personDays}</td>
                                <td className="px-6 py-4">{row.expenditure}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
