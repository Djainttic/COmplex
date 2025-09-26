// components/settings/ModuleSettingsForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings } from '../../types';
import Button from '../ui/Button';
import { useToasts } from '../../hooks/useToasts';
import { NAV_ITEMS } from '../../constants';

const ModuleSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const [moduleStatus, setModuleStatus] = useState(settings.moduleStatus);
    const canWrite = hasPermission('settings:write');
    
    // Filter out items that are not modules (like dashboard, settings, profile)
    const availableModules = NAV_ITEMS.filter(item => 
        item.path !== '/' && item.path !== '/parametres' && item.path !== '/profil'
    ).map(item => ({
        key: item.path.substring(1),
        label: item.label,
    }));

    useEffect(() => {
        setModuleStatus(settings.moduleStatus);
    }, [settings.moduleStatus]);

    const handleToggle = (moduleKey: string) => {
        setModuleStatus(prev => ({
            ...prev,
            [moduleKey]: !prev[moduleKey],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newSettings: Settings = { ...settings, moduleStatus };
        await updateSettings(newSettings);
        addToast({ message: 'Statut des modules mis à jour.', type: 'success' });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Gestion des Modules</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Activez ou désactivez les différents modules de l'application pour personnaliser l'interface utilisateur.
                    </p>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {availableModules.map(module => (
                            <div key={module.key} className="py-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{module.label}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Contrôle l'accès au module {module.label}.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggle(module.key)}
                                    disabled={!canWrite}
                                    className={`${
                                        moduleStatus[module.key] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50`}
                                >
                                    <span
                                        className={`${
                                            moduleStatus[module.key] ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            )}
        </form>
    );
};

export default ModuleSettingsForm;
