import React from 'react';

interface ReportCardProps {
  title: string;
  value: string | number;
  description: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export default ReportCard;