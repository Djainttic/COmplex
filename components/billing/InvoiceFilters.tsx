import React, { useState, useEffect } from 'react';
import { InvoiceStatus } from '../../types';

interface InvoiceFiltersProps {
  onFilterChange: (filters: {
    searchTerm: string;
    status: string;
    startDate: string;
    endDate: string;
  }) => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({ onFilterChange }) => {
  const getMonthDateRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    };
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState(getMonthDateRange().start);
  const [endDate, setEndDate] = useState(getMonthDateRange().end);

  useEffect(() => {
    const timer = setTimeout(() => {
        onFilterChange({ searchTerm, status, startDate, endDate });
    }, 300); // Debounce search term input
    
    return () => clearTimeout(timer);
  }, [searchTerm, status, startDate, endDate, onFilterChange]);
  
  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rechercher (N° ou Client)
          </label>
          <input
            type="search"
            id="search-term"
            placeholder="INV-2024-001..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={commonInputStyle}
          />
        </div>
         <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`pl-3 pr-10 py-2.5 text-base ${commonInputStyle}`}
          >
            <option value="all">Toutes</option>
            {(Object.values(InvoiceStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={commonInputStyle}
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={commonInputStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;