// components/settings/PricingSettingsForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToasts } from '../../hooks/useToasts';
import { PricingRule } from '../../types';
import Button from '../ui/Button';
import PricingRuleFormModal from './PricingRuleFormModal';

const PricingSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const canWrite = hasPermission('settings:write');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
    
    const handleAddRule = () => {
        setSelectedRule(null);
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: PricingRule) => {
        setSelectedRule(rule);
        setIsModalOpen(true);
    };
    
    const handleSaveRule = (rule: PricingRule) => {
        let updatedRules;
        if (selectedRule) { // Editing
            updatedRules = settings.financial.pricingRules.map(r => r.id === rule.id ? rule : r);
        } else { // Adding
            updatedRules = [...settings.financial.pricingRules, { ...rule, id: `rule-${Date.now()}` }];
        }
        updateSettings({ ...settings, financial: { ...settings.financial, pricingRules: updatedRules }});
        addToast({ message: `Règle de tarification "${rule.name}" sauvegardée.`, type: 'success' });
        setIsModalOpen(false);
    };

    const handleDeleteRule = (ruleId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette règle ?")) {
            const updatedRules = settings.financial.pricingRules.filter(r => r.id !== ruleId);
            updateSettings({ ...settings, financial: { ...settings.financial, pricingRules: updatedRules }});
            addToast({ message: `Règle supprimée.`, type: 'success' });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Règles de Tarification Dynamique</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Créez des règles pour ajuster automatiquement les prix en fonction des jours ou des saisons.</p>
                </div>
                {canWrite && <Button onClick={handleAddRule}>Ajouter une règle</Button>}
            </div>

            <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                    {settings.financial.pricingRules.map(rule => (
                        <li key={rule.id} className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Ajustement de {rule.value}{rule.adjustmentType.includes('Percentage') ? '%' : ' DZD'}
                                </p>
                            </div>
                            {canWrite && (
                                <div className="space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEditRule(rule)}>Modifier</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteRule(rule.id)}>Supprimer</Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && (
                <PricingRuleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRule}
                    rule={selectedRule}
                />
            )}
        </div>
    );
};

export default PricingSettingsForm;
