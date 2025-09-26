// components/pages/LoyaltyPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Client, LoyaltyLog, LoyaltyLogType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import LoyaltyStats from '../loyalty/LoyaltyStats';
import ClientLoyaltyTable from '../loyalty/ClientLoyaltyTable';
import LoyaltyHistoryTable from '../loyalty/LoyaltyHistoryTable';
import PointAdjustmentModal from '../loyalty/PointAdjustmentModal';

const LoyaltyPage: React.FC = () => {
    const { settings, hasPermission, allUsers, fetchUsers, currentUser, loadingUsers } = useAuth();
    const { 
        clients, loyaltyLogs,
        fetchClients, fetchLoyaltyLogs, addLoyaltyLog, updateClient,
        isLoading: isDataLoading
    } = useData();

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isAdjustModalOpen, setAdjustModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'clients' | 'history'>('clients');

    useEffect(() => {
        fetchClients();
        fetchLoyaltyLogs();
        fetchUsers();
    }, [fetchClients, fetchLoyaltyLogs, fetchUsers]);
    
    const handleOpenAdjustModal = (client: Client) => {
        setSelectedClient(client);
        setAdjustModalOpen(true);
    };

    const handleSaveAdjustment = async (clientId: string, pointsChange: number, reason: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client && currentUser) {
            const newTotal = (client.loyaltyPoints || 0) + pointsChange;
            
            // Update client points
            await updateClient({ ...client, loyaltyPoints: newTotal });

            // Create a log entry
            const logEntry: Omit<LoyaltyLog, 'id'> = {
                clientId,
                type: LoyaltyLogType.ManualAdjustment,
                pointsChange,
                reason,
                timestamp: new Date().toISOString(),
                adminUserId: currentUser.id,
            };
            await addLoyaltyLog(logEntry);
        }
        setAdjustModalOpen(false);
        setSelectedClient(null);
    };
    
    const canWrite = hasPermission('loyalty:write');
    const isLoading = isDataLoading.clients || isDataLoading.loyaltyLogs || loadingUsers;
    
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    if (!settings.loyalty.enabled) {
        return (
            <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Programme de Fidélité</h1>
                 <div className="mt-8 text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                    <p className="text-lg text-gray-700 dark:text-gray-300">Le programme de fidélité est actuellement désactivé.</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Vous pouvez l'activer dans les Paramètres sous l'onglet "Fidélité".
                    </p>
                 </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Programme de Fidélité</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les points de vos clients et consultez l'historique des transactions.
            </p>

            <div className="mt-6">
                <LoyaltyStats clients={clients} settings={settings} />
            </div>
            
            <div className="mt-8">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('clients')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'clients' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Solde des Clients
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Historique des Points
                        </button>
                    </nav>
                </div>
            </div>
            
            <div className="mt-6">
                {isLoading ? (
                    <div className="text-center py-12">Chargement des données de fidélité...</div>
                ) : activeTab === 'clients' ? (
                    <ClientLoyaltyTable clients={clients} onAdjustPoints={handleOpenAdjustModal} canWrite={canWrite} />
                ) : (
                    <LoyaltyHistoryTable logs={loyaltyLogs} clientMap={clientMap} userMap={userMap} />
                )}
            </div>

            {isAdjustModalOpen && selectedClient && (
                <PointAdjustmentModal
                    isOpen={isAdjustModalOpen}
                    onClose={() => setAdjustModalOpen(false)}
                    onSave={handleSaveAdjustment}
                    client={selectedClient}
                />
            )}
        </div>
    );
};

export default LoyaltyPage;
