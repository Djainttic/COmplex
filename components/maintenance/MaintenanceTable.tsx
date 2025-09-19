import React from 'react';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../ui/Badge';
import { formatDateDDMMYYYY } from '../../constants';

interface MaintenanceTableProps {
  requests: MaintenanceRequest[];
  bungalowMap: Map<string, string>;
  userMap: Map<string, string>;
  onEdit: (request: MaintenanceRequest) => void;
  onDelete: (requestId: string) => void;
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ requests, bungalowMap, userMap, onEdit, onDelete }) => {
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('maintenance:write');

    const getStatusBadgeColor = (status: MaintenanceStatus) => {
        switch (status) {
            case MaintenanceStatus.Resolved: return 'green';
            case MaintenanceStatus.InProgress: return 'blue';
            case MaintenanceStatus.Pending: return 'yellow';
            case MaintenanceStatus.Cancelled: return 'gray';
            default: return 'gray';
        }
    };

    const getPriorityBadgeColor = (priority: MaintenancePriority) => {
        switch (priority) {
            case MaintenancePriority.High: return 'red';
            case MaintenancePriority.Medium: return 'yellow';
            case MaintenancePriority.Low: return 'green';
            default: return 'gray';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Bungalow</th>
                            <th scope="col" className="px-6 py-3">Priorité</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Assigné à</th>
                            <th scope="col" className="px-6 py-3">Statut</th>
                            <th scope="col" className="px-6 py-3">Signalé le</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{bungalowMap.get(req.bungalowId) || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <Badge color={getPriorityBadgeColor(req.priority)}>{req.priority}</Badge>
                                </td>
                                <td className="px-6 py-4 max-w-sm truncate" title={req.description}>{req.description}</td>
                                <td className="px-6 py-4">{req.assignedToId ? userMap.get(req.assignedToId) : 'Non assigné'}</td>
                                <td className="px-6 py-4">
                                    <Badge color={getStatusBadgeColor(req.status)}>{req.status}</Badge>
                                </td>
                                <td className="px-6 py-4">{formatDateDDMMYYYY(req.createdDate)}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {canWrite && (
                                        <>
                                            <button onClick={() => onEdit(req)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Modifier</button>
                                            <button onClick={() => onDelete(req.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaintenanceTable;
