
import React, { useState, useEffect } from 'react';
import { BungalowStatus, BungalowType } from '../../types';

interface BungalowFiltersProps {
  onFilterChange: (filters: { status: string; type: string; capacity: number }) => void;
}

const BungalowFilters: React.FC<BungalowFiltersProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState(0);

  useEffect(() => {
    onFilterChange({ status, type, capacity });
  }, [status, type, capacity, onFilterChange]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Tous</option>
            {/* FIX: Explicitly cast enum values to string array for mapping */}
            {(Object.values(BungalowStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            id="type-filter"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Tous</option>
            {/* FIX: Explicitly cast enum values to string array for mapping */}
            {(Object.values(BungalowType) as string[]).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="capacity-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacité min.</label>
          <input
            type="number"
            id="capacity-filter"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default BungalowFilters;