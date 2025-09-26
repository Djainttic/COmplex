// components/settings/GeneralSettingsForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings } from '../../types';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';
import { useToasts } from '../../hooks/useToasts';

const GeneralSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const [formData, setFormData] = useState(settings.general);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.general);
    }, [settings.general]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newSettings: Settings = { ...settings, general: formData };
        await updateSettings(newSettings);
        addToast({ message: 'Paramètres généraux mis à jour.', type: 'success' });
    };

    const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm disabled:opacity-50";

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Paramètres Généraux</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez le nom du complexe et les images de marque.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="complexName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du complexe</label>
                        <input
                            type="text"
                            name="complexName"
                            id="complexName"
                            value={formData.complexName}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className={commonInputStyle}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                    <ImageUpload
                        value={formData.logoUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
                        disabled={!canWrite}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image de la page de connexion</label>
                    <ImageUpload
                        value={formData.loginImageUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, loginImageUrl: url }))}
                        disabled={!canWrite}
                    />
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

export default GeneralSettingsForm;
