import React, { useState, useEffect } from 'react';
import { AmenitySetting } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BungalowAmenityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (amenity: AmenitySetting) => void;
    amenity: AmenitySetting | null;
}

const BungalowAmenityFormModal: React.FC<BungalowAmenityFormModalProps> = ({ isOpen, onClose, onSave, amenity }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (amenity) {
            setName(amenity.name);
        } else {
            setName('');
        }
    }, [amenity, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const amenityToSave: AmenitySetting = {
            id: amenity?.id || `amenity-${Date.now()}`,
            name: name.trim(),
        };
        onSave(amenityToSave);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={amenity ? "Modifier l'équipement" : "Ajouter un équipement"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amenity-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'équipement</label>
                    <input
                        type="text"
                        name="amenity-name"
                        id="amenity-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default BungalowAmenityFormModal;