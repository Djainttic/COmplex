import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { CommunicationLog } from '../../types';
import Button from '../ui/Button';
import CommunicationLogTable from '../communication/CommunicationLogTable';
import CommunicationFormModal from '../communication/CommunicationFormModal';

const CommunicationPage: React.FC = () => {
    const { currentUser, allUsers, hasPermission } = useAuth();
    const { communicationLogs, addCommunicationLog, clients } = useData();
    const [isModalOpen, setModalOpen] = useState(false);

    const canWrite = hasPermission('communication:write');
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const handleSendMessage = () => {
        setModalOpen(true);
    };

    const handleSaveMessage = (log: Omit<CommunicationLog, 'id' | 'sentDate' | 'sentBy'>) => {
        if (!currentUser) return;
        
        const newLog: CommunicationLog = {
            ...log,
            id: `comm-${Date.now()}`,
            sentDate: new Date().toISOString(),
            status: 'Envoyé', // Mock status
            sentBy: currentUser.id,
        };
        addCommunicationLog(newLog);
        setModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communication</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Envoyez des messages et consultez l'historique des communications.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleSendMessage}>
                        Envoyer un message
                    </Button>
                )}
            </div>

            <CommunicationLogTable 
                logs={communicationLogs}
                clientMap={new Map(clients.map(c => [c.id, c.name]))}
                userMap={userMap}
            />

            {isModalOpen && (
                <CommunicationFormModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveMessage}
                    clients={clients}
                />
            )}
        </div>
    );
};

export default CommunicationPage;