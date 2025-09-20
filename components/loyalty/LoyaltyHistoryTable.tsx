import React from 'react';
import { LoyaltyLog, LoyaltyLogType } from '../../types';
import { formatDateTimeDDMMYYYY } from '../../constants';
import Badge from '../ui/Badge';

interface LoyaltyHistoryTableProps {
    logs: LoyaltyLog[];
    clientMap: Map<string, string>;
    userMap: Map<string, string>;
}

const LoyaltyHistoryTable: React.FC<LoyaltyHistoryTableProps> = ({ logs, clientMap, userMap }) => {
    
    const getTypeBadgeColor = (type: LoyaltyLogType) => {
        switch (type) {
            case LoyaltyLogType.Earned:
            case LoyaltyLogType.InitialBonus:
                return 'green';
            case LoyaltyLogType.Redeemed:
                return 'red';
            case LoyaltyLogType.ManualAdjustment:
                return 'blue';
            default:
                return 'gray';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-8">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Changement</th>
                            <th scope="col" className="px-6 py-3">Raison</th>
                            <th scope="col" className="px-6 py-3">Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap">{formatDateTimeDDMMYYYY(log.timestamp)}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {clientMap.get(log.clientId) || 'Client inconnu'}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={getTypeBadgeColor(log.type)}>{log.type}</Badge>
                                </td>
                                <td className={`px-6 py-4 font-semibold ${log.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {log.pointsChange > 0 ? '+' : ''}{log.pointsChange}
                                </td>
                                <td className="px-6 py-4 max-w-sm truncate" title={log.reason}>
                                    {log.reason}
                                </td>
                                <td className="px-6 py-4">
                                    {log.adminUserId ? userMap.get(log.adminUserId) : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoyaltyHistoryTable;