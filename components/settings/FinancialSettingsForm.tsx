import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings, Currency, FiscalInfo } from '../../types';
import Button from '../ui/Button';

const FinancialSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const [formData, setFormData] = useState(settings.financial);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.financial);
    }, [settings.financial]);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, currency: e.target.value as Currency }));
    };
    
    const handleFiscalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            fiscalInfo: { ...prev.fiscalInfo, [name]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, financial: formData });
        // Add toast notification for success
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Configuration Financière</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez la devise et les informations fiscales.</p>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Devise</label>
                    <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleCurrencyChange}
                        disabled={!canWrite}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    >
                        {(Object.values(Currency) as string[]).map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Informations Fiscales (Algérie)</h3>
                     <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* FIX: Iterate over keys for type safety */}
                        {(Object.keys(formData.fiscalInfo) as Array<keyof FiscalInfo>).map((key) => (
                             <div className="sm:col-span-3" key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">{key}</label>
                                <input
                                    type="text"
                                    name={key}
                                    id={key}
                                    value={formData.fiscalInfo[key]}
                                    onChange={handleFiscalInfoChange}
                                    disabled={!canWrite}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                                />
                            </div>
                        ))}
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

export default FinancialSettingsForm;