import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SecuritySettings } from '../../types';
import Button from '../ui/Button';
import { formatTimeAgo } from '../../constants';

// Mock data for active sessions
const MOCK_SESSIONS = [
    { id: 1, ip: '192.168.1.1', device: 'Cet appareil (Chrome sur Windows)', lastActivity: new Date().toISOString() },
    { id: 2, ip: '98.12.345.67', device: 'iPhone 15 Pro', lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 3, ip: '201.23.45.67', device: 'Safari sur MacBook Air', lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

const SecuritySettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');
    const [formData, setFormData] = useState<SecuritySettings>(
         JSON.parse(JSON.stringify(settings.security)) // Deep copy
    );

    useEffect(() => {
        setFormData(JSON.parse(JSON.stringify(settings.security)));
    }, [settings.security]);
    
    const handlePolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            passwordPolicy: {
                ...prev.passwordPolicy,
                [name]: type === 'checkbox' ? checked : parseInt(value, 10) || 0
            }
        }));
    };
    
    const handle2FAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
         setFormData(prev => ({
            ...prev,
            twoFactorAuth: {
                ...prev.twoFactorAuth,
                enforced: checked
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, security: formData });
        alert("Paramètres de sécurité mis à jour !");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Password Policy Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Politique de Mots de Passe</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Définissez les exigences minimales pour les mots de passe des utilisateurs.
                    </p>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                        <label htmlFor="minLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longueur minimale</label>
                        <input
                            type="number" name="minLength" id="minLength"
                            value={formData.passwordPolicy.minLength}
                            onChange={handlePolicyChange}
                            disabled={!canWrite}
                            min="6"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
                    </div>
                    <div className="sm:col-span-4 self-end">
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(formData.passwordPolicy) as Array<keyof typeof formData.passwordPolicy>)
                                .filter(key => key !== 'minLength').map(key => {
                                    const labels: { [key: string]: string } = {
                                        requireUppercase: 'Majuscule (A-Z)',
                                        requireLowercase: 'Minuscule (a-z)',
                                        requireNumbers: 'Chiffre (0-9)',
                                        requireSymbols: 'Symbole (!-@)',
                                    };
                                    return (
                                        <div key={key} className="relative flex items-start">
                                            <div className="flex items-center h-5">
                                                <input id={key} name={key} type="checkbox"
                                                    checked={formData.passwordPolicy[key as keyof typeof formData.passwordPolicy] as boolean}
                                                    onChange={handlePolicyChange} disabled={!canWrite}
                                                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={key} className="font-medium text-gray-700 dark:text-gray-300">{labels[key]}</label>
                                            </div>
                                        </div>
                                    )
                            })}
                        </div>
                    </div>
                </div>
            </div>

             {/* Two-Factor Authentication Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Authentification à Deux Facteurs (2FA)</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Renforcez la sécurité en exigeant une deuxième étape de vérification lors de la connexion.
                    </p>
                </div>
                <div className="mt-4 relative flex items-start">
                    <div className="flex items-center h-5">
                         <input id="enforced" name="enforced" type="checkbox"
                            checked={formData.twoFactorAuth.enforced}
                            onChange={handle2FAChange}
                            disabled={!canWrite}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enforced" className="font-medium text-gray-700 dark:text-gray-300">Forcer l'authentification 2FA pour tous les utilisateurs</label>
                         <p className="text-xs text-gray-500 dark:text-gray-400">(Fonctionnalité en cours de développement)</p>
                    </div>
                </div>
            </div>

            {/* Active Sessions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Sessions Actives</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Gérez les sessions connectées à votre compte.
                    </p>
                </div>
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 mt-4">
                    {MOCK_SESSIONS.map(session => (
                        <li key={session.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center">
                                {session.device.includes('iPhone') ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session.device}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.ip} - Dernière activité : {formatTimeAgo(session.lastActivity)}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                 <div className="mt-4">
                     <Button type="button" variant="secondary" size="sm" onClick={() => alert("Toutes les autres sessions ont été déconnectées (simulation).")}>Se déconnecter de toutes les autres sessions</Button>
                </div>
            </div>

            {canWrite && (
                <div className="pt-2 text-right">
                    <Button type="submit">Enregistrer les paramètres de sécurité</Button>
                </div>
            )}
        </form>
    );
};

export default SecuritySettingsForm;