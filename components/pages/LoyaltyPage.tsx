import React, { useState } from 'react';
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
    // FIX: `allUsers` is provided by `useAuth`, not `useData`.
    const { currentUser, settings, hasPermission, allUsers } = useAuth();
    const { clients, updateClient, loyaltyLogs, addLoyaltyLog } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const canWrite = hasPermission('loyalty:write');

    const handleOpenModal = (client: Client) => {
        setSelectedClient(client);
        setModalOpen(true);
    };

    const handleAdjustPoints = (clientId: string, points: number, reason: string) => {
        const client = clients.find(c => c.id === clientId);
        if (!client || !currentUser) return;

        const updatedClient = {
            ...client,
            loyaltyPoints: client.loyaltyPoints + points
        };
        updateClient(updatedClient);

        addLoyaltyLog({
            id: `log-${Date.now()}`,
            clientId,
            type: LoyaltyLogType.ManualAdjustment,
            pointsChange: points,
            reason,
            timestamp: new Date().toISOString(),
            adminUserId: currentUser.id
        });
        
        setModalOpen(false);
    };

    const renderTabContent = () => {
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