import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType }) => {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {change && (
          <p className={`text-sm ${changeColor}`}>
            {change}
          </p>
        )}
      </div>
      <div className="text-primary-500 bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
