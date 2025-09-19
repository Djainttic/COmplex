import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';

const GeneralSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const [formData, setFormData] = useState(settings.general);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.general);
    }, [settings.general]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, general: formData });
        // Add toast notification for success
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Informations Générales</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Informations de base sur votre établissement.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="complexName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du complexe</label>
                        <input
                            type="text"
                            name="complexName"
                            id="complexName"
                            value={formData.complexName}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
                    </div>

                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                        <ImageUpload
                            value={formData.logoUrl}
                            onChange={(url) => setFormData(prev => ({...prev, logoUrl: url}))}
                        />
                    </div>

                     <div className="sm:col-span-2">
                        <label htmlFor="bungalowCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de bungalows</label>
                        <input
                            type="number"
                            name="bungalowCount"
                            id="bungalowCount"
                            value={formData.bungalowCount}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
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

export default GeneralSettingsForm;