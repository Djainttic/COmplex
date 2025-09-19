import React from 'react';

interface ChartData {
  month: string;
  revenue: number;
}

interface MonthlyRevenueChartProps {
  data: ChartData[];
  currency: string;
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ data, currency }) => {
    // Find the max revenue to scale the chart bars, round up to the nearest 50k for a clean axis
    const maxRevenue = Math.ceil(Math.max(...data.map(d => d.revenue), 0) / 50000) * 50000;
    
    // Generate Y-axis labels
    const yAxisLabels = [];
    if (maxRevenue > 0) {
        for (let i = 4; i >= 0; i--) {
            yAxisLabels.push((maxRevenue / 4) * i);
        }
    } else {
         yAxisLabels.push(0);
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendances des revenus mensuels (Année en cours)</h3>
            <div className="flex" style={{ height: '300px' }}>
                {/* Y-axis Labels */}
                <div className="flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-4 text-right">
                    {yAxisLabels.map(label => (
                        <div key={label}>{`${(label / 1000)}k`}</div>
                    ))}
                </div>

                {/* Chart Bars */}
                <div className="w-full grid grid-cols-12 gap-2 border-l border-b border-gray-200 dark:border-gray-700 pl-2">
                    {data.map(item => (
                        <div key={item.month} className="flex flex-col items-center justify-end">
                             <div className="relative group w-full h-full flex items-end">
                                <div
                                    className="bg-primary-500 hover:bg-primary-600 transition-colors w-full rounded-t-md"
                                    style={{ height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
                                >
                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {item.revenue.toLocaleString('fr-FR')} {currency}
                                    </div>
                                </div>
                            </div>
                            <span className="mt-2 text-xs text-gray-600 dark:text-gray-300">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MonthlyRevenueChart;