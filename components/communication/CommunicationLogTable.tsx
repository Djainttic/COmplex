import React from 'react';
import { CommunicationLog } from '../../types';
import { formatDateTimeDDMMYYYY } from '../../constants';
import Badge from '../ui/Badge';

interface CommunicationLogTableProps {
    logs: CommunicationLog[];
    clientMap: Map<string, string>;
    userMap: Map<string, string>;
}

const CommunicationLogTable: React.FC<CommunicationLogTableProps> = ({ logs, clientMap, userMap }) => {

    const getRecipientNames = (recipientIds: string[]) => {
        if (recipientIds.length === 0) return 'Aucun';
        if (recipientIds.length > 2) return `${recipientIds.length} destinataires`;
        return recipientIds.map(id => clientMap.get(id) || 'Inconnu').join(', ');
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Sujet / Message</th>
                            <th scope="col" className="px-6 py-3">Destinataires</th>
                            <th scope="col" className="px-6 py-3">Envoyé par</th>
                            <th scope="col" className="px-6 py-3">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap">{formatDateTimeDDMMYYYY(log.sentDate)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{log.subject}</div>
                                    <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs" title={log.body}>{log.body}</div>
                                </td>
                                <td className="px-6 py-4">{getRecipientNames(log.recipients)}</td>
                                <td className="px-6 py-4">{userMap.get(log.sentBy) || 'Utilisateur inconnu'}</td>
                                <td className="px-6 py-4">
                                    <Badge color={log.status === 'Envoyé' ? 'green' : 'red'}>
                                        {log.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommunicationLogTable;