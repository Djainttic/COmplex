
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const AISettingsForm: React.FC = () => {
    const { settings, updateSettings } = useAuth();
    const [isAiEnabled, setIsAiEnabled] = useState(settings.moduleStatus.ai ?? true);

    const handleToggle = () => {
        setIsAiEnabled(prev => !prev);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedModuleStatus = { ...settings.moduleStatus, ai: isAiEnabled };
        updateSettings({ ...settings, moduleStatus: updatedModuleStatus });
        alert("Les paramètres de l'IA ont été mis à jour.");
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Intelligence Artificielle & Intégrations</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Activez ou désactivez les fonctionnalités basées sur l'IA (Google Gemini).
                </p>
            </div>
            
            <div className="mt-6 border-t dark:border-gray-700 pt-6">
                 <div className="relative flex items-start p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                        <label htmlFor="ai-module" className="font-medium text-gray-900 dark:text-white">Fonctionnalités IA (Gemini)</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           Permet de générer des analyses et des résumés intelligents dans les rapports.
                        </p>
                    </div>
                    <div className="ml-3 flex items-center h-6">
                        <label htmlFor="ai-module" className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="ai-module" 
                                className="sr-only peer"
                                checked={isAiEnabled}
                                onChange={handleToggle}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                </div>
            </div>
            
             <div className="pt-8 text-right">
                <Button type="submit">Enregistrer les modifications</Button>
            </div>
        </form>
    );
};

export default AISettingsForm;
