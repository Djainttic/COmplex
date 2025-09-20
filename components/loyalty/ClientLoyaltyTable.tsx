import React from 'react';
import { Client } from '../../types';
import Button from '../ui/Button';

interface ClientLoyaltyTableProps {
    clients: Client[];
    onAdjustPoints: (client: Client) => void;
    canWrite: boolean;
}

const ClientLoyaltyTable: React.FC<ClientLoyaltyTableProps> = ({ clients, onAdjustPoints, canWrite }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Points Actuels</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.sort((a,b) => b.loyaltyPoints - a.loyaltyPoints).map((client) => (
                            <tr key={client.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="text-base font-semibold">{client.name}</div>
                                    <div className="font-normal text-gray-500">{client.email}</div>
                                </th>
                                <td className="px-6 py-4 font-medium text-lg text-gray-900 dark:text-white">
                                    {client.loyaltyPoints.toLocaleString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {canWrite && (
                                        <Button size="sm" variant="secondary" onClick={() => onAdjustPoints(client)}>
                                            Ajuster les points
                                        </Button>
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

export default ClientLoyaltyTable;
