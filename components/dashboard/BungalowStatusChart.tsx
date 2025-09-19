import React from 'react';
import { Bungalow, BungalowStatus } from '../../types';

interface BungalowStatusChartProps {
    bungalows: Bungalow[];
}

const STATUS_CONFIG: { [key in BungalowStatus]: { color: string; label: string } } = {
    [BungalowStatus.Available]: { color: 'text-green-500', label: 'Disponible' },
    [BungalowStatus.Occupied]: { color: 'text-red-500', label: 'Occupé' },
    [BungalowStatus.Cleaning]: { color: 'text-blue-500', label: 'Nettoyage' },
    [BungalowStatus.Maintenance]: { color: 'text-yellow-500', label: 'Maintenance' },
};

const COLOR_MAP: { [key in BungalowStatus]: string } = {
    [BungalowStatus.Available]: '#22c55e', // green-500
    [BungalowStatus.Occupied]: '#ef4444', // red-500
    [BungalowStatus.Cleaning]: '#3b82f6', // blue-500
    [BungalowStatus.Maintenance]: '#eab308', // yellow-500
};

const DonutSlice: React.FC<{
    color: string;
    percentage: number;
    radius: number;
    strokeWidth: number;
    startAngle: number;
}> = ({ color, percentage, radius, strokeWidth, startAngle }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const transform = `rotate(${startAngle - 90} ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`;

    return (
        <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            transform={transform}
        />
    );
};


const BungalowStatusChart: React.FC<BungalowStatusChartProps> = ({ bungalows }) => {
    const totalBungalows = bungalows.length;

    const statusCounts = bungalows.reduce((acc, bungalow) => {
        acc[bungalow.status] = (acc[bungalow.status] || 0) + 1;
        return acc;
    }, {} as { [key in BungalowStatus]?: number });

    const chartData = (Object.keys(STATUS_CONFIG) as BungalowStatus[]).map(status => ({
        status,
        count: statusCounts[status] || 0,
        percentage: totalBungalows > 0 ? ((statusCounts[status] || 0) / totalBungalows) * 100 : 0,
    }));

    let accumulatedPercentage = 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">État des Bungalows</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {chartData.map(({ status, percentage }) => {
                            const startAngle = (accumulatedPercentage / 100) * 360;
                            accumulatedPercentage += percentage;
                            return (
                                <DonutSlice
                                    key={status}
                                    color={COLOR_MAP[status]}
                                    percentage={percentage}
                                    radius={45}
                                    strokeWidth={10}
                                    startAngle={startAngle}
                                />
                            );
                        })}
                    </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalBungalows}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                    </div>
                </div>
                <div className="w-full">
                    <ul className="space-y-2">
                        {chartData.map(({ status, count, percentage }) => (
                            <li key={status} className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${STATUS_CONFIG[status].color.replace('text-', 'bg-')}`}></span>
                                    <span className="text-gray-700 dark:text-gray-300">{STATUS_CONFIG[status].label}</span>
                                </div>
                                <div className="font-medium text-gray-800 dark:text-white">
                                    {count} ({percentage.toFixed(0)}%)
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BungalowStatusChart;