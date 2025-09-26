// components/pages/LoyaltyPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Client, LoyaltyLog } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToasts } from '../../hooks/useToasts';
import LoyaltyStats from '../loyalty/LoyaltyStats';
import ClientLoyaltyTable from '../loyalty/ClientLoyaltyTable';
import LoyaltyHistoryTable from '../loyalty/LoyaltyHistoryTable';
import PointAdjustmentModal from '../loyalty/PointAdjustmentModal';

const LoyaltyPage: React.FC = () => {
    const { settings, hasPermission, allUsers, fetchUsers, loadingUsers, currentUser } = useAuth();
    const { 
        clients, loyaltyLogs,
        fetchClients, fetchLoyaltyLogs,
        updateClient, addLoyaltyLog,
        isLoading: isDataLoading
    } = useData();
    const { addToast } = useToasts();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
        fetchLoyaltyLogs();
        fetchUsers();
    }, [fetchClients, fetchLoyaltyLogs, fetchUsers]);

    const canWrite = hasPermission('loyalty:write');

    const handleAdjustPoints = (client: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleSavePoints = async (client: Client, pointsChange: number, reason: string) => {
        const newPoints = (client.loyaltyPoints || 0) + pointsChange;
        await updateClient({ ...client, loyaltyPoints: newPoints });
        
        await addLoyaltyLog({
            clientId: client.id,
            pointsChange,
            reason,
            timestamp: new Date().toISOString(),
            type: 'Ajustement manuel',
            adminUserId: currentUser?.id,
        });

        addToast({ message: `Points de ${client.name} ajustés.`, type: 'success' });
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const isLoading = isDataLoading.clients || isDataLoading.loyaltyLogs || loadingUsers;
    
    if (!settings.loyalty.enabled) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Module de Fidélité Désactivé</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Pour accéder à cette page, veuillez activer le programme de fidélité dans les paramètres.
                </p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Programme de Fidélité</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Suivez les points de vos clients et consultez l'historique des transactions.
                </p>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12">Chargement des données de fidélité...</div>
            ) : (
                <div className="space-y-8">
                    <LoyaltyStats clients={clients} settings={settings} />
                    <ClientLoyaltyTable clients={clients} onAdjustPoints={handleAdjustPoints} canWrite={canWrite} />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Historique Récent</h2>
                        <LoyaltyHistoryTable logs={loyaltyLogs} clientMap={clientMap} userMap={userMap} />
                    </div>
                </div>
            )}
            
            {isModalOpen && selectedClient && (
                <PointAdjustmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePoints}
                    client={selectedClient}
                />
            )}
        </div>
    );
};

export default LoyaltyPage;
