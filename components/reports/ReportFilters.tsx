import React from 'react';

interface ReportFiltersProps {
  onDateChange: (startDate: string, endDate: string) => void;
  onPresetChange: (preset: '7d' | '30d' | 'month') => void;
  startDate: string;
  endDate: string;
  activePreset: '7d' | '30d' | 'month' | 'custom';
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ onDateChange, onPresetChange, startDate, endDate, activePreset }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      onDateChange(value, endDate);
    } else {
      onDateChange(startDate, value);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => onPresetChange('7d')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activePreset === '7d' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
          7 derniers jours
        </button>
        <button onClick={() => onPresetChange('30d')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activePreset === '30d' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
          30 derniers jours
        </button>
         <button onClick={() => onPresetChange('month')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activePreset === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
          Ce mois-ci
        </button>
      </div>
       <div className="flex items-center gap-2">
        <input type="date" name="startDate" value={startDate} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"/>
        <span className="text-gray-500 dark:text-gray-400">à</span>
        <input type="date" name="endDate" value={endDate} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"/>
      </div>
    </div>
  );
};

export default ReportFilters;