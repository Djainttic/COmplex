import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    client: Client | null; // null for new, Client object for editing
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const { hasPermission, settings } = useAuth();
    // Admin has full write access, can edit points.
    const canEditPoints = hasPermission('users:write'); 
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        loyaltyPoints: 0,
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                address: client.address || '',
                loyaltyPoints: client.loyaltyPoints || 0,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                loyaltyPoints: 0,
            });
        }
    }, [client, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clientToSave: Client = {
            ...client, // includes id if editing
            ...formData,
            id: client?.id || '',
            registrationDate: client?.registrationDate || new Date().toISOString(), // Preserve original or set new
        };
        onSave(clientToSave);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={client ? "Modifier la fiche client" : "Ajouter un client"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                    <textarea
                        name="address"
                        id="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                 {client && settings.loyalty.enabled && (
                    <div>
                        <label htmlFor="loyaltyPoints" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Points de fidélité</label>
                        <input
                            type="number"
                            name="loyaltyPoints"
                            id="loyaltyPoints"
                            value={formData.loyaltyPoints}
                            onChange={handleChange}
                            disabled={!canEditPoints}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm disabled:opacity-50"
                        />
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default ClientFormModal;