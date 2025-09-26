// components/settings/LoyaltySettingsForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings } from '../../types';
import Button from '../ui/Button';
import { useToasts } from '../../hooks/useToasts';

const LoyaltySettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const [formData, setFormData] = useState(settings.loyalty);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.loyalty);
    }, [settings.loyalty]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value, 10) || 0,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newSettings: Settings = { ...settings, loyalty: formData };
        await updateSettings(newSettings);
        addToast({ message: 'Paramètres de fidélité mis à jour.', type: 'success' });
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm disabled:opacity-50";

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Programme de Fidélité</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configurez comment les clients gagnent et utilisent les points de fidélité.</p>
                </div>

                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="enabled"
                            name="enabled"
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enabled" className="font-medium text-gray-700 dark:text-gray-300">
                            Activer le programme de fidélité
                        </label>
                    </div>
                </div>

                {formData.enabled && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="pointsPerNight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Points gagnés par nuit</label>
                            <input type="number" name="pointsPerNight" id="pointsPerNight" value={formData.pointsPerNight} onChange={handleChange} disabled={!canWrite} className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="pointsForFirstReservation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bonus première réservation</label>
                            <input type="number" name="pointsForFirstReservation" id="pointsForFirstReservation" value={formData.pointsForFirstReservation} onChange={handleChange} disabled={!canWrite} className={inputStyle} />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="pointsToCurrencyValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Valeur d'un point (en {settings.financial.currency})
                            </label>
                            <input type="number" name="pointsToCurrencyValue" id="pointsToCurrencyValue" value={formData.pointsToCurrencyValue} onChange={handleChange} disabled={!canWrite} className={inputStyle} />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Exemple: si la valeur est 10, alors 100 points valent 1000 {settings.financial.currency}.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            )}
        </form>
    );
};

export default LoyaltySettingsForm;
