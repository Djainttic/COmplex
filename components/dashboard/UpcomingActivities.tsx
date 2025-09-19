import React from 'react';
import { Reservation, Client, Bungalow } from '../../types';
import { formatDateDDMMYYYY } from '../../constants';

interface UpcomingActivitiesProps {
    reservations: Reservation[];
    clients: Client[];
    bungalows: Bungalow[];
}

interface Activity {
    type: 'check-in' | 'check-out';
    date: Date;
    clientName: string;
    bungalowName: string;
}

const UpcomingActivities: React.FC<UpcomingActivitiesProps> = ({ reservations, clients, bungalows }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const clientMap = new Map(clients.map(c => [c.id, c.name]));
    const bungalowMap = new Map(bungalows.map(b => [b.id, b.name]));

    const activities = reservations.reduce((acc, res) => {
        const resStart = new Date(res.startDate);
        resStart.setHours(0, 0, 0, 0);
        const resEnd = new Date(res.endDate);
        resEnd.setHours(0, 0, 0, 0);

        if (resStart.getTime() === today.getTime() || resStart.getTime() === tomorrow.getTime()) {
            acc.push({
                type: 'check-in',
                date: resStart,
                clientName: clientMap.get(res.clientId) || 'Inconnu',
                bungalowName: bungalowMap.get(res.bungalowId) || 'Inconnu',
            });
        }
        if (resEnd.getTime() === today.getTime() || resEnd.getTime() === tomorrow.getTime()) {
             acc.push({
                type: 'check-out',
                date: resEnd,
                clientName: clientMap.get(res.clientId) || 'Inconnu',
                bungalowName: bungalowMap.get(res.bungalowId) || 'Inconnu',
            });
        }
        return acc;
    }, [] as Activity[]).sort((a, b) => a.date.getTime() - b.date.getTime());

    const CheckInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
    const CheckOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activités à Venir</h3>
            {activities.length === 0 ? (
                 <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Aucune arrivée ou départ prévu pour aujourd'hui ou demain.</p>
            ) : (
                <ul className="space-y-4">
                    {activities.map((activity, index) => (
                        <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                                {activity.type === 'check-in' ? <CheckInIcon /> : <CheckOutIcon />}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {activity.type === 'check-in' ? 'Arrivée' : 'Départ'} : {activity.clientName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {activity.bungalowName} - {activity.date.getTime() === today.getTime() ? "Aujourd'hui" : "Demain"}, {formatDateDDMMYYYY(activity.date)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UpcomingActivities;