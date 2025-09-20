import React, { useState, useEffect } from 'react';
import { Invoice, Client, Reservation, InvoiceItem, InvoiceStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface InvoiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoice: Invoice) => void;
    invoice: Invoice | null;
    clients: Client[];
    reservations: Reservation[];
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, onSave, invoice, clients, reservations }) => {
    
    const getInitialFormData = (): Partial<Invoice> => {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 15);
        
        return {
            clientId: '',
            reservationId: '',
            issueDate: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            status: InvoiceStatus.Unpaid,
            items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
            totalAmount: 0,
        };
    };
    
    const [formData, setFormData] = useState<Partial<Invoice>>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (invoice) {
                setFormData({
                    ...invoice,
                    issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
                    dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [invoice, isOpen]);
    
    useEffect(() => {
        const total = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
        setFormData(prev => ({ ...prev, totalAmount: total }));
    }, [formData.items]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            const item = { ...newItems[index] };
            
            if (field === 'description') {
                item.description = value as string;
            } else {
                const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                if (field === 'quantity') item.quantity = numValue;
                if (field === 'unitPrice') item.unitPrice = numValue;
            }
            
            item.total = item.quantity * item.unitPrice;
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };
    
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), { description: '', quantity: 1, unitPrice: 0, total: 0 }]
        }));
    };
    
    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId || !formData.items || formData.items.length === 0) {
            alert("Veuillez sélectionner un client et ajouter au moins un article.");
            return;
        }
        onSave({
            ...getInitialFormData(),
            ...invoice, // Preserves original ID and other fields
            ...formData,
        } as Invoice);
    };

    const inputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={invoice ? "Modifier la facture" : "Créer une facture"}
            size="2xl"
            footer={<>
                <Button variant="secondary" onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit}>Enregistrer</Button>
            </>}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                        <select name="clientId" id="clientId" value={formData.clientId} onChange={handleChange} required className={`mt-1 ${inputStyle}`}>
                            <option value="" disabled>Sélectionner un client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reservationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Réservation (Optionnel)</label>
                        <select name="reservationId" id="reservationId" value={formData.reservationId} onChange={handleChange} className={`mt-1 ${inputStyle}`}>
                            <option value="">Aucune</option>
                            {reservations.map(r => <option key={r.id} value={r.id}>#{r.id.slice(-5)}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'émission</label>
                        <input type="date" name="issueDate" id="issueDate" value={formData.issueDate} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'échéance</label>
                        <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className={`mt-1 ${inputStyle}`} />
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Articles de la facture</label>
                    {formData.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-md">
                            <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className={`${inputStyle} flex-grow`} />
                            <input type="number" placeholder="Qté" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className={`${inputStyle} w-20`} />
                            <input type="number" placeholder="Prix" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className={`${inputStyle} w-28`} />
                            <span className="w-24 text-right pr-2 text-sm text-gray-600 dark:text-gray-300">{(item.total || 0).toLocaleString('fr-FR')}</span>
                            <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-500 hover:text-red-700">&times;</button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={addItem}>Ajouter un article</Button>
                </div>
                
                {/* Total */}
                 <div className="flex justify-end pt-4 border-t dark:border-gray-600">
                    <div className="w-full max-w-sm space-y-2">
                         <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                            <span>Total</span>
                            <span>{(formData.totalAmount || 0).toLocaleString('fr-FR')} DZD</span>
                        </div>
                    </div>
                </div>

            </form>
        </Modal>
    );
};

export default InvoiceFormModal;
