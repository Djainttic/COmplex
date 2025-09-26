// components/settings/SecuritySettingsForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings, PasswordPolicy } from '../../types';
import Button from '../ui/Button';
import { useToasts } from '../../hooks/useToasts';

const SecuritySettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const [formData, setFormData] = useState(settings.security);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.security);
    }, [settings.security]);

    const handlePolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const policyKey = name as keyof PasswordPolicy;
        setFormData(prev => ({
            ...prev,
            passwordPolicy: {
                ...prev.passwordPolicy,
                [policyKey]: type === 'checkbox' ? checked : parseInt(value, 10) || 0
            }
        }));
    };
    
    const handle2FAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            twoFactorAuth: { ...prev.twoFactorAuth, enforced: e.target.checked }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newSettings: Settings = { ...settings, security: formData };
        await updateSettings(newSettings);
        addToast({ message: 'Paramètres de sécurité mis à jour.', type: 'success' });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Politique de mot de passe</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Définissez les exigences pour les mots de passe des utilisateurs.</p>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="minLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longueur minimale</label>
                            <input
                                type="number"
                                name="minLength"
                                id="minLength"
                                value={formData.passwordPolicy.minLength}
                                onChange={handlePolicyChange}
                                disabled={!canWrite}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                            />
                        </div>
                        <div className="sm:col-span-4 flex items-end space-x-6">
                             {(Object.keys(formData.passwordPolicy) as Array<keyof PasswordPolicy>)
                                .filter(key => typeof formData.passwordPolicy[key] === 'boolean')
                                .map(key => (
                                <div key={key} className="relative flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id={key}
                                            name={key}
                                            type="checkbox"
                                            checked={formData.passwordPolicy[key] as boolean}
                                            onChange={handlePolicyChange}
                                            disabled={!canWrite}
                                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor={key} className="font-medium text-gray-700 dark:text-gray-300">
                                            { {requireUppercase: "Majuscule", requireLowercase: "Minuscule", requireNumbers: "Chiffre", requireSymbols: "Symbole"}[key] }
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Authentification à deux facteurs (2FA)</h3>
                     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Renforcez la sécurité des comptes utilisateurs.</p>
                     <div className="mt-4 relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="enforced2FA"
                                name="enforced"
                                type="checkbox"
                                checked={formData.twoFactorAuth.enforced}
                                onChange={handle2FAChange}
                                disabled={!canWrite}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="enforced2FA" className="font-medium text-gray-700 dark:text-gray-300">
                                Forcer l'activation de la 2FA pour tous les utilisateurs
                            </label>
                        </div>
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

export default SecuritySettingsForm;
