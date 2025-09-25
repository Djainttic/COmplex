// components/settings/LicenseSettingsForm.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { formatDateDDMMYYYY } from '../../constants';

const LicenseSettingsForm: React.FC = () => {
    const { settings } = useAuth();
    const { license } = settings;

    const getStatusColor = (status: 'Active' | 'Expired' | 'Trial') => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Trial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Licence de l'Application</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Gérez les informations de licence et d'abonnement de cette instance de l'application.
                </p>
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Clé de Licence</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{license.key}</dd>
                    </div>
                    <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(license.status)}`}>
                                {license.status === 'Active' ? 'Actif' : license.status}
                            </span>
                        </dd>
                    </div>
                    <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan d'Abonnement</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">Plan Professionnel</dd>
                    </div>
                    <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expire le</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDateDDMMYYYY(license.expiresOn)}</dd>
                    </div>
                </dl>
            </div>

             <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 text-right">
                <Button 
                    type="button" 
                    onClick={() => alert("Redirection vers le portail de gestion de l'abonnement (simulation).")}
                >
                    Gérer l'abonnement
                </Button>
            </div>
        </div>
    );
};

export default LicenseSettingsForm;
