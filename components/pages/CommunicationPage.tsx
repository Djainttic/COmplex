// components/pages/CommunicationPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { CommunicationLog } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Button from '../ui/Button';
import CommunicationLogTable from '../communication/CommunicationLogTable';
import CommunicationFormModal from '../communication/CommunicationFormModal';

const CommunicationPage: React.FC = () => {
    const { currentUser, allUsers, fetchUsers, hasPermission, loadingUsers } = useAuth();
    const { 
        communicationLogs, clients, 
        fetchCommunicationLogs, fetchClients, addCommunicationLog,
        isLoading: isDataLoading
    } = useData();

    const [isFormModalOpen, setFormModalOpen] = useState(false);

    useEffect(() => {
        fetchCommunicationLogs();
        fetchClients();
        fetchUsers();
    }, [fetchCommunicationLogs, fetchClients, fetchUsers]);

    const handleSaveCommunication = async (logData: Omit<CommunicationLog, 'id' | 'sentDate' | 'sentBy'>) => {
        if (currentUser) {
            await addCommunicationLog({
                ...logData,
                sentDate: new Date().toISOString(),
                sentBy: currentUser.id,
                // In a real app, the status would be determined by an email sending service
                status: Math.random() > 0.1 ? 'Envoyé' : 'Échoué',
            });
        }
        setFormModalOpen(false);
    };

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const canWrite = hasPermission('communication:write');
    const isLoading = isDataLoading.clients || loadingUsers;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communication</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Envoyez des messages à vos clients et consultez l'historique des communications.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={() => setFormModalOpen(true)}>
                        Nouveau Message
                    </Button>
                )}
            </div>
            
            {isLoading ? (
                <div className="text-center py-12">Chargement de l'historique...</div>
            ) : (
                <CommunicationLogTable 
                    logs={communicationLogs}
                    clientMap={clientMap}
                    userMap={userMap}
                />
            )}

            {isFormModalOpen && (
                <CommunicationFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveCommunication}
                    clients={clients}
                />
            )}
        </div>
    );
};

export default CommunicationPage;
