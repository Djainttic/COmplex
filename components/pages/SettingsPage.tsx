// components/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import GeneralSettingsForm from '../settings/GeneralSettingsForm';
import FinancialSettingsForm from '../settings/FinancialSettingsForm';
import SecuritySettingsForm from '../settings/SecuritySettingsForm';
import RolesSettingsForm from '../settings/RolesSettingsForm';
import BungalowSettingsForm from '../settings/BungalowSettingsForm';
import PricingSettingsForm from '../settings/PricingSettingsForm';
import LoyaltySettingsForm from '../settings/LoyaltySettingsForm';
import ModuleSettingsForm from '../settings/ModuleSettingsForm';
import LicenseSettingsForm from '../settings/LicenseSettingsForm';
import { UserRole } from '../../types';


type SettingsTab = 'general' | 'financial' | 'bungalows' | 'pricing' | 'loyalty' | 'security' | 'roles' | 'modules' | 'license';

const SettingsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    
    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    const tabs: { id: SettingsTab; label: string; component: React.ReactNode; adminOnly?: boolean }[] = [
        { id: 'general', label: 'Général', component: <GeneralSettingsForm /> },
        { id: 'financial', label: 'Financier', component: <FinancialSettingsForm /> },
        { id: 'bungalows', label: 'Bungalows', component: <BungalowSettingsForm /> },
        { id: 'pricing', label: 'Tarification', component: <PricingSettingsForm /> },
        { id: 'loyalty', label: 'Fidélité', component: <LoyaltySettingsForm /> },
        { id: 'security', label: 'Sécurité', component: <SecuritySettingsForm /> },
        { id: 'roles', label: 'Rôles', component: <RolesSettingsForm />, adminOnly: true },
        { id: 'modules', label: 'Modules', component: <ModuleSettingsForm />, adminOnly: true },
        { id: 'license', label: 'Licence', component: <LicenseSettingsForm />, adminOnly: true },
    ];
    
    const visibleTabs = tabs.filter(tab => !tab.adminOnly || isSuperAdmin);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Configurez les paramètres généraux et les préférences de l'application.
            </p>

            <div className="mt-8">
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex flex-wrap gap-x-2 sm:gap-x-8" aria-label="Tabs">
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div>
                    {visibleTabs.find(tab => tab.id === activeTab)?.component}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
