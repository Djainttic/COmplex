

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import GeneralSettingsForm from '../settings/GeneralSettingsForm';
import FinancialSettingsForm from '../settings/FinancialSettingsForm';
import SecuritySettingsForm from '../settings/SecuritySettingsForm';
import BungalowSettingsForm from '../settings/BungalowSettingsForm';
import RolesSettingsForm from '../settings/RolesSettingsForm';
import PricingSettingsForm from '../settings/PricingSettingsForm';
import ModuleSettingsForm from '../settings/ModuleSettingsForm';

type Tab = 'general' | 'financial' | 'pricing' | 'security' | 'bungalows' | 'roles' | 'modules';

const SettingsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    
    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettingsForm />;
            case 'financial': return <FinancialSettingsForm />;
            case 'pricing': return <PricingSettingsForm />;
            case 'security': return <SecuritySettingsForm />;
            case 'bungalows': return <BungalowSettingsForm />;
            case 'roles': return <RolesSettingsForm />;
            case 'modules': return isSuperAdmin ? <ModuleSettingsForm /> : null;
            default: return null;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les paramètres généraux, financiers et de sécurité de l'application.
            </p>

            <div className="mt-6">
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex flex-wrap gap-2 sm:gap-x-4" aria-label="Tabs">
                        <TabButton tabName="general" label="Général" />
                        <TabButton tabName="financial" label="Financier" />
                        <TabButton tabName="pricing" label="Tarification" />
                        <TabButton tabName="bungalows" label="Bungalows" />
                        <TabButton tabName="roles" label="Rôles" />
                        <TabButton tabName="security" label="Sécurité" />
                        {isSuperAdmin && <TabButton tabName="modules" label="Modules" />}
                    </nav>
                </div>

                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;