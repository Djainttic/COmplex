// components/settings/AISettingsForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { useToasts } from '../../hooks/useToasts';

const AISettingsForm: React.FC = () => {
    const { hasPermission } = useAuth();
    const { addToast } = useToasts();
    const canWrite = hasPermission('settings:write');
    const [apiKey, setApiKey] = useState(''); // This would come from settings in a real app

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would save this key securely
        console.log("Saving API Key (simulation):", apiKey);
        addToast({ message: "Paramètres d'IA mis à jour (simulation).", type: 'success' });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">IA & Intégrations</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Gérez les intégrations avec des services d'intelligence artificielle comme Gemini.
                    </p>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clé API Gemini (Google AI)
                    </label>
                    <input
                        type="password"
                        name="apiKey"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        disabled={!canWrite}
                        placeholder="Entrez votre clé API..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Cette clé est requise pour les fonctionnalités basées sur l'IA. Elle est stockée de manière sécurisée.
                    </p>
                </div>
            </div>

            {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer</Button>
                </div>
            )}
        </form>
    );
};

export default AISettingsForm;
