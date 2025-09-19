import React from 'react';
import { Reservation, MaintenanceRequest, Client, Bungalow } from '../../types';
import { formatTimeAgo } from '../../constants';

interface RecentActivityFeedProps {
    reservations: Reservation[];
    maintenanceRequests: MaintenanceRequest[];
    clients: Client[];
    bungalows: Bungalow[];
}

interface ActivityItem {
    id: string;
    type: 'reservation' | 'maintenance';
    timestamp: string;
    description: string;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ reservations, maintenanceRequests, clients, bungalows }) => {

    const clientMap = new Map(clients.map(c => [c.id, c.name]));
    const bungalowMap = new Map(bungalows.map(b => [b.id, b.name]));

    const mappedReservations = reservations.map(r => ({
        id: r.id,
        type: 'reservation' as const,
        timestamp: r.startDate, // Using start date as the activity time
        description: `Nouvelle réservation pour ${clientMap.get(r.clientId) || 'un client'} dans ${bungalowMap.get(r.bungalowId) || 'un bungalow'}.`
    }));

    const mappedMaintenance = maintenanceRequests.map(m => ({
        id: m.id,
        type: 'maintenance' as const,
        timestamp: m.createdDate,
        description: `Demande de maintenance pour ${bungalowMap.get(m.bungalowId) || 'un bungalow'}: "${m.description}"`
    }));

    const sortedActivities = [...mappedReservations, ...mappedMaintenance]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5); // Get latest 5 activities

    const getIconForType = (type: 'reservation' | 'maintenance') => {
        if (type === 'reservation') {
            return (
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            );
        }
        return (
            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activité Récente</h3>
            {sortedActivities.length === 0 ? (
                 <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Aucune activité récente à afficher.</p>
            ) : (
                 <div className="flow-root">
                    <ul role="list" className="-mb-8">
                        {sortedActivities.map((activity, index) => (
                            <li key={activity.id}>
                                <div className="relative pb-8">
                                    {index !== sortedActivities.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>{getIconForType(activity.type)}</div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-md" title={activity.description}>
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                <time dateTime={activity.timestamp}>{formatTimeAgo(activity.timestamp)}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RecentActivityFeed;