import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { CommunicationLog } from '../../types';
import Button from '../ui/Button';
import CommunicationLogTable from '../communication/CommunicationLogTable';
import CommunicationFormModal from '../communication/CommunicationFormModal';

const CommunicationPage: React.FC = () => {
    const { currentUser, allUsers, hasPermission, fetchUsers, loadingUsers } = useAuth();
    const { communicationLogs, addCommunicationLog, clients, fetchCommunicationLogs, fetchClients, isLoading: isDataLoading } = useData();
    const [isModalOpen, setModalOpen] = useState(false);

    const canWrite = hasPermission('communication:write');
    
    useEffect(() => {
        fetchCommunicationLogs();
        fetchClients();
        fetchUsers();
    }, [fetchCommunicationLogs, fetchClients, fetchUsers]);
    
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const handleSendMessage = () => {
        setModalOpen(true);
    };

    const handleSaveMessage = async (log: Omit<CommunicationLog, 'id' | 'sentDate' | 'sentBy'>) => {
        if (!currentUser) return;
        
        const newLog: Partial<CommunicationLog> = {
            ...log,
            sentDate: new Date().toISOString(),
            status: 'Envoyé', // Mock status
            sentBy: currentUser.id,
        };
        const result = await addCommunicationLog(newLog);
        
        if (result.success) {
            setModalOpen(false);
        } else {
            alert(`Erreur lors de l'envoi du message : ${result.error?.message || 'Erreur inconnue'}`);
        }
    };
    
    const showLoading = (isDataLoading.communicationLogs || isDataLoading.clients || loadingUsers) && communicationLogs.length === 0;

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
            
            {showLoading ? (
                 <div className="text-center py-12">Chargement de l'historique...</div>
            ) : (
                <CommunicationLogTable 
                    logs={communicationLogs}
                    clientMap={new Map(clients.map(c => [c.id, c.name]))}
                    userMap={userMap}
                />
            )}

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
