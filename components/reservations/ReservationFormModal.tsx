import React, { useState, useEffect } from 'react';
import { Reservation, Bungalow, Client, ReservationStatus, PricingAdjustmentType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ReservationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (reservation: Reservation) => void;
    reservation: Partial<Reservation> | null;
    bungalows: Bungalow[];
    clients: Client[];
}

const ReservationFormModal: React.FC<ReservationFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    reservation,
    bungalows,
    clients
}) => {
    const { settings } = useAuth();
    const [formData, setFormData] = useState<Partial<Reservation>>({});
    const [appliedRules, setAppliedRules] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const today = new Date();
    
        const startDateString = reservation?.startDate 
            ? new Date(reservation.startDate).toISOString().split('T')[0] 
            : today.toISOString().split('T')[0];

        let endDateString;
        if (reservation?.endDate) {
            endDateString = new Date(reservation.endDate).toISOString().split('T')[0];
        } else {
            const startDateObj = reservation?.startDate ? new Date(reservation.startDate) : today;
            const nextDay = new Date(startDateObj);
            nextDay.setDate(startDateObj.getDate() + 1);
            endDateString = nextDay.toISOString().split('T')[0];
        }

        // Prevent end date from being before or same as start date
        if (new Date(endDateString) <= new Date(startDateString)) {
             const startDateObj = new Date(startDateString);
             const nextDay = new Date(startDateObj);
             nextDay.setDate(startDateObj.getDate() + 1);
             endDateString = nextDay.toISOString().split('T')[0];
        }

        setFormData({
            status: ReservationStatus.Pending, // Default status for new reservations
            ...reservation,
            startDate: startDateString,
            endDate: endDateString,
        });
    }
}, [reservation, isOpen]);

    useEffect(() => {
        const calculatePrice = () => {
            if (!formData.bungalowId || !formData.startDate || !formData.endDate) {
                return { price: 0, rules: [] };
            }
            const bungalow = bungalows.find(b => b.id === formData.bungalowId);
            const bungalowType = settings.bungalows.types.find(t => t.name === bungalow?.type);
            if (!bungalow || !bungalowType) return { price: 0, rules: [] };

            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end <= start) return { price: 0, rules: [] };
            
            let totalPrice = 0;
            const uniqueAppliedRules = new Set<string>();
            const pricingRules = settings.financial.pricingRules || [];

            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                let priceForNight = bungalow.pricePerNight;
                let applicableRule = null;

                // Priority 1: Find a matching date-based (seasonal) rule
                const dateBasedRule = pricingRules.find(rule => {
                    if (!rule.startDate || !rule.endDate) return false;
                    const ruleStart = new Date(rule.startDate);
                    const ruleEnd = new Date(rule.endDate);
                    return d >= ruleStart && d <= ruleEnd &&
                           (rule.bungalowTypeIds.length === 0 || rule.bungalowTypeIds.includes(bungalowType.id));
                });

                if (dateBasedRule) {
                    applicableRule = dateBasedRule;
                } else {
                    // Priority 2: Find a matching day-of-week rule if no seasonal rule was found
                    const dayOfWeek = d.getDay(); // 0 = Sunday
                    const dayOfWeekRule = pricingRules.find(rule => 
                        rule.daysOfWeek?.includes(dayOfWeek) &&
                        (rule.bungalowTypeIds.length === 0 || rule.bungalowTypeIds.includes(bungalowType.id))
                    );
                    if (dayOfWeekRule) {
                        applicableRule = dayOfWeekRule;
                    }
                }

                if (applicableRule) {
                    uniqueAppliedRules.add(applicableRule.name);
                    switch (applicableRule.adjustmentType) {
                        case PricingAdjustmentType.PercentageIncrease:
                            priceForNight *= (1 + applicableRule.value / 100);
                            break;
                        case PricingAdjustmentType.FixedIncrease:
                            priceForNight += applicableRule.value;
                            break;
                        case PricingAdjustmentType.PercentageDiscount:
                            priceForNight *= (1 - applicableRule.value / 100);
                            break;
                        case PricingAdjustmentType.FixedDiscount:
                            priceForNight -= applicableRule.value;
                            break;
                        case PricingAdjustmentType.SetPrice:
                            priceForNight = applicableRule.value;
                            break;
                    }
                }
                totalPrice += priceForNight;
            }
            return { price: Math.round(totalPrice), rules: Array.from(uniqueAppliedRules) };
        };

        const { price, rules } = calculatePrice();
        setFormData(prev => ({...prev, totalPrice: price }));
        setAppliedRules(rules);
    }, [formData.bungalowId, formData.startDate, formData.endDate, bungalows, settings]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };
    
            // If start date changes, ensure end date is valid and at least one day after
            if (name === 'startDate') {
                const newStartDate = new Date(value);
                const currentEndDate = newFormData.endDate ? new Date(newFormData.endDate) : new Date(0);
                
                // Set hours to 0 to compare dates only
                newStartDate.setHours(0, 0, 0, 0);
                currentEndDate.setHours(0, 0, 0, 0);
    
                if (newStartDate >= currentEndDate) {
                    const newEndDate = new Date(newStartDate);
                    newEndDate.setDate(newEndDate.getDate() + 1);
                    newFormData.endDate = newEndDate.toISOString().split('T')[0];
                }
            }
            
            return newFormData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.bungalowId || !formData.clientId || !formData.startDate || !formData.endDate) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            alert("La date de départ doit être après la date d'arrivée.");
            return;
        }

        setIsSaving(true);
        await onSave({
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
        } as Reservation);
        setIsSaving(false);
    };

    const title = reservation?.id ? "Modifier la réservation" : "Ajouter une réservation";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="bungalowId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bungalow</label>
                    <select
                        name="bungalowId"
                        id="bungalowId"
                        value={formData.bungalowId || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="" disabled>Sélectionner un bungalow</option>
                        {bungalows.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                    <select
                        name="clientId"
                        id="clientId"
                        value={formData.clientId || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="" disabled>Sélectionner un client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'arrivée</label>
                        <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            value={formData.startDate || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de départ</label>
                        <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            value={formData.endDate || ''}
                            onChange={handleChange}
                            min={formData.startDate ? new Date(new Date(formData.startDate).setDate(new Date(formData.startDate).getDate() + 1)).toISOString().split('T')[0] : ''}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                        />
                    </div>
                </div>
                
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                    <select
                        name="status"
                        id="status"
                        value={formData.status || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        {(Object.values(ReservationStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="pt-4 border-t dark:border-gray-600">
                    <div className="flex justify-between items-center">
                         <span className="font-semibold text-gray-700 dark:text-gray-300 text-base">Montant total:</span>
                         <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {(formData.totalPrice || 0).toLocaleString('fr-FR')} DZD
                         </span>
                    </div>
                     {appliedRules.length > 0 && (
                        <p className="text-xs text-right text-green-600 dark:text-green-400 mt-1">
                            Règle(s) appliquée(s) : {appliedRules.join(', ')}
                        </p>
                    )}
                </div>

            </form>
        </Modal>
    );
};

export default ReservationFormModal;