import React, { useState, useEffect } from 'react';
import { BungalowTypeSetting } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BungalowTypeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: BungalowTypeSetting) => void;
    bungalowType: BungalowTypeSetting | null;
}

const BungalowTypeFormModal: React.FC<BungalowTypeFormModalProps> = ({ isOpen, onClose, onSave, bungalowType }) => {
    const [formData, setFormData] = useState({
        name: '',
        capacity: 2,
        defaultPrice: 0,
        amenities: '',
        description: ''
    });

    useEffect(() => {
        if (bungalowType) {
            setFormData({
                name: bungalowType.name,
                capacity: bungalowType.capacity,
                defaultPrice: bungalowType.defaultPrice,
                amenities: bungalowType.amenities.join(', '),
                description: bungalowType.description
            });
        } else {
            setFormData({ name: '', capacity: 2, defaultPrice: 0, amenities: '', description: '' });
        }
    }, [bungalowType, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const typeToSave: BungalowTypeSetting = {
            id: bungalowType?.id || `new-${Date.now()}`,
            name: formData.name,
            capacity: formData.capacity,
            defaultPrice: formData.defaultPrice,
            amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
            description: formData.description,
        };
        onSave(typeToSave);
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={bungalowType ? 'Modifier le type' : 'Ajouter un type de bungalow'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du type</label>
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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacité (personnes)</label>
                        <input
                            type="number"
                            name="capacity"
                            id="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix par défaut (/nuit)</label>
                        <input
                            type="number"
                            name="defaultPrice"
                            id="defaultPrice"
                            value={formData.defaultPrice}
                            onChange={handleChange}
                            required
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipements par défaut</label>
                    <input
                        type="text"
                        name="amenities"
                        id="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        placeholder="Wi-Fi, Climatisation, Vue sur mer..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Séparez les équipements par une virgule.</p>
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default BungalowTypeFormModal;