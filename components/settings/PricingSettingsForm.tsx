import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PricingRule, FinancialSettings } from '../../types';
import Button from '../ui/Button';
import PricingRuleFormModal from './PricingRuleFormModal';
import { formatDateDDMMYYYY } from '../../constants';

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const PricingSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');
    
    const [rules, setRules] = useState<PricingRule[]>(settings.financial.pricingRules || []);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

    const handleAddRule = () => {
        setSelectedRule(null);
        setModalOpen(true);
    };

    const handleEditRule = (rule: PricingRule) => {
        setSelectedRule(rule);
        setModalOpen(true);
    };

    const handleSaveRule = (ruleToSave: PricingRule) => {
        if (selectedRule) { // Editing
            setRules(prev => prev.map(r => r.id === ruleToSave.id ? ruleToSave : r));
        } else { // Adding
            setRules(prev => [...prev, { ...ruleToSave, id: `rule-${Date.now()}` }]);
        }
        setModalOpen(false);
    };
    
    const handleDeleteRule = (ruleId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette règle de tarification ?")) {
            setRules(prev => prev.filter(r => r.id !== ruleId));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedFinancialSettings: FinancialSettings = {
            ...settings.financial,
            pricingRules: rules
        };
        updateSettings({ ...settings, financial: updatedFinancialSettings });
        alert("Les règles de tarification ont été mises à jour !");
    };

    const getBungalowTypeNames = (typeIds: string[]): string => {
        if (typeIds.length === 0) return "Tous les types";
        return typeIds.map(id => settings.bungalows.types.find(t => t.id === id)?.name).filter(Boolean).join(', ');
    };

    const getRuleApplicabilityText = (rule: PricingRule): string => {
        if (rule.startDate && rule.endDate) {
            return `Période : ${formatDateDDMMYYYY(rule.startDate)} au ${formatDateDDMMYYYY(rule.endDate)}`;
        }
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
            return `Jours : ${rule.daysOfWeek.map(d => DAY_NAMES[d]).join(', ')}`;
        }
        return "Toujours applicable";
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Règles de Tarification</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Créez des promotions ou des majorations pour des jours spécifiques ou des types de bungalow.
                        </p>
                    </div>
                    {canWrite && <Button type="button" onClick={handleAddRule}>Ajouter une règle</Button>}
                </div>

                <div className="space-y-4">
                    {rules.length === 0 ? (
                        <p className="text-center py-4 text-gray-500 dark:text-gray-400">Aucune règle de tarification n'a été définie.</p>
                    ) : (
                        rules.map(rule => (
                            <div key={rule.id} className="p-4 border dark:border-gray-700 rounded-md flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{rule.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Appliqué à : {getBungalowTypeNames(rule.bungalowTypeIds)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {getRuleApplicabilityText(rule)}
                                    </p>
                                </div>
                                {canWrite && (
                                    <div className="flex-shrink-0 space-x-2">
                                        <button type="button" onClick={() => handleEditRule(rule)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Modifier</button>
                                        <button type="button" onClick={() => handleDeleteRule(rule.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            )}
            
            {isModalOpen && (
                <PricingRuleFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveRule}
                    rule={selectedRule}
                />
            )}
        </form>
    );
};

export default PricingSettingsForm;