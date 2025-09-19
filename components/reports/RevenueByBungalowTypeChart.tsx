import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface RevenueByBungalowTypeChartProps {
  data: ChartData[];
  currency: string;
}

const RevenueByBungalowTypeChart: React.FC<RevenueByBungalowTypeChartProps> = ({ data, currency }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenus par type de bungalow</h3>
      <div className="space-y-4">
        {data.length > 0 ? data.map(item => (
          <div key={item.name} className="flex items-center">
            <span className="w-24 text-sm text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 mx-4">
              <div
                className="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold"
                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
              >
                {item.value.toLocaleString('fr-FR')} {currency}
              </div>
            </div>
          </div>
        )) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucune donnée de revenu pour la période sélectionnée.</p>
        )}
      </div>
    </div>
  );
};

export default RevenueByBungalowTypeChart;