import React from 'react';
import { User, AuditLog } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDateTimeDDMMYYYY } from '../../constants';

// Mock audit logs
const generateMockLogs = (user: User): AuditLog[] => {
    return [
        { id: '1', user: { id: user.id, name: user.name }, action: 'Connexion réussie', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), details: 'IP: 192.168.1.1' },
        { id: '2', user: { id: user.id, name: user.name }, action: 'Modification du profil', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), details: 'Champ "email" modifié.' },
        { id: '3', user: { id: user.id, name: user.name }, action: 'Tentative de connexion échouée', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), details: 'Mot de passe incorrect. IP: 192.168.1.10' },
    ];
};

interface AuditLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, user }) => {
    const logs = generateMockLogs(user);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Logs d'audit pour ${user.name}`}
            footer={
                <Button variant="secondary" onClick={onClose}>Fermer</Button>
            }
        >
            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {logs.map((log, logIdx) => (
                    <li key={log.id}>
                        <div className="relative pb-8">
                        {logIdx !== logs.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                            <div>
                            <span className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                {log.action} <span className="font-medium text-gray-900 dark:text-white">{log.details}</span>
                                </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                <time dateTime={log.timestamp}>{formatDateTimeDDMMYYYY(log.timestamp)}</time>
                            </div>
                            </div>
                        </div>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

export default AuditLogModal;