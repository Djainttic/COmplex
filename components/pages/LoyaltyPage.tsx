import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Client, LoyaltyLogType } from '../../types';
import LoyaltyStats from '../loyalty/LoyaltyStats';
import ClientLoyaltyTable from '../loyalty/ClientLoyaltyTable';
import LoyaltyHistoryTable from '../loyalty/LoyaltyHistoryTable';
import LoyaltySettingsForm from '../settings/LoyaltySettingsForm';
import PointAdjustmentModal from '../loyalty/PointAdjustmentModal';

type Tab = 'dashboard' | 'history' | 'settings';

const LoyaltyPage: React.FC = () => {
    const { currentUser, settings, hasPermission, allUsers, fetchUsers, loadingUsers } = useAuth();
    const { clients, updateClient, loyaltyLogs, addLoyaltyLog, fetchClients, fetchLoyaltyLogs, isLoading: isDataLoading } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const canWrite = hasPermission('loyalty:write');

    useEffect(() => {
        fetchClients();
        fetchLoyaltyLogs();
        fetchUsers();
    }, [fetchClients, fetchLoyaltyLogs, fetchUsers]);

    const handleOpenModal = (client: Client) => {
        setSelectedClient(client);
        setModalOpen(true);
    };

    const handleAdjustPoints = async (clientId: string, points: number, reason: string) => {
        const client = clients.find(c => c.id === clientId);
        if (!client || !currentUser) return;

        const updatedClient = {
            ...client,
            loyaltyPoints: (client.loyaltyPoints || 0) + points
        };
        const updateResult = await updateClient(updatedClient);

        if (updateResult.success) {
            await addLoyaltyLog({
                clientId,
                type: LoyaltyLogType.ManualAdjustment,
                pointsChange: points,
                reason,
                timestamp: new Date().toISOString(),
                adminUserId: currentUser.id
            });
            setModalOpen(false);
        } else {
            alert(`Erreur lors de la mise à jour des points : ${updateResult.error?.message || 'Erreur inconnue'}`);
        }
    };
    
    const showLoading = (isDataLoading.clients || isDataLoading.loyaltyLogs || loadingUsers) && clients.length === 0;

    const renderTabContent = () => {
        if (showLoading) {
            return <div className="text-center py-12">Chargement des données de fidélité...</div>;
        }
        
        switch (activeTab) {
            case 'history':
                return <LoyaltyHistoryTable 
                            logs={loyaltyLogs} 
                            clientMap={new Map(clients.map(c => [c.id, c.name]))}
                            userMap={new Map(allUsers.map(u => [u.id, u.name]))}
                        />;
            case 'settings':
                return <LoyaltySettingsForm />;
            case 'dashboard':
            default:
                return (
                    <>
                        <LoyaltyStats clients={clients} settings={settings} />
                        <div className="mt-8">
                            <ClientLoyaltyTable clients={clients} onAdjustPoints={handleOpenModal} canWrite={canWrite} />
                        </div>
                    </>
                );
        }
    };
    
    const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Programme de Fidélité</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les points de fidélité de vos clients et consultez l'historique des transactions.
            </p>

            <div className="mt-6">
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex flex-wrap gap-2 sm:gap-x-4" aria-label="Tabs">
                        <TabButton tabName="dashboard" label="Clients & Statistiques" />
                        <TabButton tabName="history" label="Historique" />
                        {canWrite && <TabButton tabName="settings" label="Paramètres" />}
                    </nav>
                </div>

                <div>
                    {renderTabContent()}
                </div>
            </div>

            {isModalOpen && selectedClient && (
                <PointAdjustmentModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    client={selectedClient}
                    onSave={handleAdjustPoints}
                />
            )}
        </div>
    );
};

export default LoyaltyPage;
