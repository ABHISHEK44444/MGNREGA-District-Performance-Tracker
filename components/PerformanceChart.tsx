import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  year: number;
  [key: string]: number | string;
}

interface PerformanceChartProps {
  data: ChartData[];
  dataKey: string;
  averageDataKey: string;
  name: string;
  averageName: string;
  fill: string;
  averageFill: string;
  forecastKey?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = React.memo(({ data, dataKey, averageDataKey, name, averageName, fill, averageFill, forecastKey }) => {
  const nextYear = data.length > 0 ? data[data.length-2]?.year + 1 : new Date().getFullYear();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-80">
      <h3 className="text-lg font-semibold text-brand-dark-gray mb-4">{name} vs State Average</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
        <defs>
            <pattern id="stripe" patternUnits="userSpaceOnUse" width="4" height="4">
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" style={{ stroke: fill, strokeWidth: 1, opacity: 0.6 }} />
            </pattern>
        </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value as number)} />
          <Tooltip
            formatter={(value: number, name, props) => {
                if (props.payload.year === nextYear && name === dataKey) {
                    return [value.toLocaleString('en-IN'), `${props.name} (Forecast)`];
                }
                return [value.toLocaleString('en-IN'), props.name];
            }}
          />
          <Legend />
          <Bar dataKey={dataKey} name={name} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={forecastKey && entry.year === nextYear ? 'url(#stripe)' : fill} />
            ))}
          </Bar>
          <Bar dataKey={averageDataKey} name={averageName} fill={averageFill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});