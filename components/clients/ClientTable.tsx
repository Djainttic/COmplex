import React from 'react';
import { Client } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatDateDDMMYYYY } from '../../constants';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, onEdit, onDelete }) => {
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('clients:write');

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Contact</th>
                            <th scope="col" className="px-6 py-3">Date d'inscription</th>
                            <th scope="col" className="px-6 py-3">Points de fidélité</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="text-base font-semibold">{client.name}</div>
                                    <div className="font-normal text-gray-500">{client.address || 'Adresse non spécifiée'}</div>
                                </th>
                                <td className="px-6 py-4">
                                    <div>{client.email}</div>
                                    <div className="text-gray-500">{client.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {formatDateDDMMYYYY(client.registrationDate)}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {client.loyaltyPoints}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {canWrite && (
                                        <>
                                            <button onClick={() => onEdit(client)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Modifier</button>
                                            <button onClick={() => onDelete(client.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
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

export default ClientTable;