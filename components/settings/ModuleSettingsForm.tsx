import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { NAV_ITEMS } from '../../constants';

// Filter out items that should not be toggleable modules
const MODULE_ITEMS = NAV_ITEMS.filter(item => 
    !['/', '/profil'].includes(item.path)
);

const ModuleSettingsForm: React.FC = () => {
    const { settings, updateSettings } = useAuth();
    const [moduleStatus, setModuleStatus] = useState(settings.moduleStatus);

    const handleToggle = (moduleKey: string) => {
        setModuleStatus(prev => ({
            ...prev,
            [moduleKey]: !prev[moduleKey]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, moduleStatus });
        alert("La visibilité des modules a été mise à jour.");
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Gestion des Modules</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Activez ou désactivez les modules pour contrôler les fonctionnalités accessibles par les utilisateurs.
                </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULE_ITEMS.map(item => {
                    const moduleKey = item.path.substring(1); // e.g. '/bungalows' -> 'bungalows'
                    const isActive = moduleStatus[moduleKey] ?? true;
                    
                    return (
                        <div key={moduleKey} className="relative flex items-start p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex-1 min-w-0">
                                <label htmlFor={moduleKey} className="font-medium text-gray-900 dark:text-white">{item.label}</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isActive ? 'Activé' : 'Désactivé'} - Contrôle l'accès à la section {item.label}.
                                </p>
                            </div>
                            <div className="ml-3 flex items-center h-6">
                                <label htmlFor={moduleKey} className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id={moduleKey} 
                                        className="sr-only peer"
                                        checked={isActive}
                                        onChange={() => handleToggle(moduleKey)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
            
             <div className="pt-8 text-right">
                <Button type="submit">Enregistrer les modifications</Button>
            </div>
        </form>
    );
};

export default ModuleSettingsForm;