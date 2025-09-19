import React, { useState, useEffect } from 'react';
import { PricingRule, PricingAdjustmentType, BungalowTypeSetting } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface PricingRuleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: PricingRule) => void;
    rule: PricingRule | null;
}

const ADJUSTMENT_TYPE_LABELS: { [key in PricingAdjustmentType]: string } = {
    [PricingAdjustmentType.PercentageIncrease]: 'Augmentation en %',
    [PricingAdjustmentType.FixedIncrease]: 'Augmentation Fixe (DZD)',
    [PricingAdjustmentType.PercentageDiscount]: 'Réduction en %',
    [PricingAdjustmentType.FixedDiscount]: 'Réduction Fixe (DZD)',
    [PricingAdjustmentType.SetPrice]: 'Nouveau Prix Fixe (DZD)',
};

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

type RuleType = 'recurring' | 'seasonal';

const PricingRuleFormModal: React.FC<PricingRuleFormModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const { settings } = useAuth();
    const [formData, setFormData] = useState<Partial<PricingRule>>({});
    const [ruleType, setRuleType] = useState<RuleType>('recurring');

    const getInitialFormData = (): Partial<PricingRule> => ({
        name: '',
        adjustmentType: PricingAdjustmentType.PercentageIncrease,
        value: 0,
        daysOfWeek: [],
        bungalowTypeIds: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    });

    useEffect(() => {
        if (rule) {
            setFormData({
                ...getInitialFormData(),
                ...rule,
            });
            setRuleType(rule.startDate && rule.endDate ? 'seasonal' : 'recurring');
        } else {
            setFormData(getInitialFormData());
            setRuleType('recurring');
        }
    }, [rule, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleDayToggle = (dayIndex: number) => {
        setFormData(prev => {
            const days = new Set(prev.daysOfWeek || []);
            if (days.has(dayIndex)) {
                days.delete(dayIndex);
            } else {
                days.add(dayIndex);
            }
            return { ...prev, daysOfWeek: Array.from(days).sort() };
        });
    };

    const handleBungalowTypeToggle = (typeId: string) => {
         setFormData(prev => {
            const types = new Set(prev.bungalowTypeIds || []);
            if (types.has(typeId)) {
                types.delete(typeId);
            } else {
                types.add(typeId);
            }
            return { ...prev, bungalowTypeIds: Array.from(types) };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const ruleToSave: Partial<PricingRule> = {
            id: rule?.id || '',
            ...formData,
        };

        if (ruleType === 'recurring') {
            delete ruleToSave.startDate;
            delete ruleToSave.endDate;
        } else { // seasonal
            if (!ruleToSave.startDate || !ruleToSave.endDate || new Date(ruleToSave.endDate) < new Date(ruleToSave.startDate)) {
                alert("Veuillez spécifier une plage de dates valide.");
                return;
            }
            delete ruleToSave.daysOfWeek;
        }

        onSave(ruleToSave as PricingRule);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={rule ? 'Modifier la règle de tarification' : 'Ajouter une règle de tarification'}
            footer={<>
                <Button variant="secondary" onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit}>Enregistrer</Button>
            </>}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la règle</label>
                    <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="adjustmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type d'ajustement</label>
                        <select name="adjustmentType" id="adjustmentType" value={formData.adjustmentType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                            {Object.entries(ADJUSTMENT_TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valeur</label>
                        <input type="number" name="value" id="value" value={formData.value || 0} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Règle</label>
                     <div className="mt-2 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setRuleType('recurring')} className={`px-4 py-2 text-sm font-medium border rounded-l-md ${ruleType === 'recurring' ? 'bg-primary-600 text-white border-primary-600 z-10' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>Récurrente</button>
                        <button type="button" onClick={() => setRuleType('seasonal')} className={`-ml-px px-4 py-2 text-sm font-medium border rounded-r-md ${ruleType === 'seasonal' ? 'bg-primary-600 text-white border-primary-600 z-10' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>Saisonnière / Événement</button>
                    </div>
                </div>

                {ruleType === 'recurring' ? (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jours d'application</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {DAY_NAMES.map((day, index) => (
                                <button type="button" key={day} onClick={() => handleDayToggle(index)} className={`px-3 py-1 text-sm rounded-full ${formData.daysOfWeek?.includes(index) ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
                            <input type="date" name="startDate" id="startDate" value={formData.startDate || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin</label>
                            <input type="date" name="endDate" id="endDate" value={formData.endDate || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm" />
                        </div>
                    </div>
                )}

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appliquer aux types de bungalow</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Laisser vide pour appliquer à tous les types.</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 border border-gray-200 dark:border-gray-600 rounded-md p-4">
                        {settings.bungalows.types.map(type => (
                            <div key={type.id} className="flex items-center">
                                <input id={`type-${type.id}`} type="checkbox" checked={formData.bungalowTypeIds?.includes(type.id)} onChange={() => handleBungalowTypeToggle(type.id)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

            </form>
        </Modal>
    );
};

export default PricingRuleFormModal;