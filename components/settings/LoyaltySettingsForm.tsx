import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoyaltySettings } from '../../types';
import Button from '../ui/Button';

const LoyaltySettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const [formData, setFormData] = useState<LoyaltySettings>(settings.loyalty);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.loyalty);
    }, [settings.loyalty]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, loyalty: formData });
        alert("Paramètres du programme de fidélité mis à jour !");
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Programme de Fidélité</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configurez les règles d'attribution automatique des points de fidélité.
                    </p>
                </div>

                <div className="relative flex items-start pt-4">
                    <div className="flex items-center h-5">
                        <input
                            id="enabled"
                            name="enabled"
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enabled" className="font-medium text-gray-700 dark:text-gray-300">
                            Activer le programme de fidélité
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="pointsPerNight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Points par nuitée
                        </label>
                        <input
                            type="number"
                            name="pointsPerNight"
                            id="pointsPerNight"
                            value={formData.pointsPerNight}
                            onChange={handleChange}
                            disabled={!canWrite || !formData.enabled}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                           Points attribués pour chaque nuit d'un séjour confirmé.
                        </p>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="pointsForFirstReservation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bonus première réservation
                        </label>
                        <input
                            type="number"
                            name="pointsForFirstReservation"
                            id="pointsForFirstReservation"
                            value={formData.pointsForFirstReservation}
                            onChange={handleChange}
                            disabled={!canWrite || !formData.enabled}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                           Points bonus offerts à un client après son premier séjour.
                        </p>
                    </div>
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

export default LoyaltySettingsForm;