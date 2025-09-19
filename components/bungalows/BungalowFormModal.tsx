// components/bungalows/BungalowFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Bungalow, BungalowStatus, BungalowType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import ImageUpload from '../ui/ImageUpload';

interface BungalowFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bungalow: Bungalow) => void;
    bungalow: Bungalow | null;
}

const BungalowFormModal: React.FC<BungalowFormModalProps> = ({ isOpen, onClose, onSave, bungalow }) => {
    const { settings } = useAuth();
    const commonInputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm";

    const getInitialFormData = () => {
        const defaultType = settings.bungalows.types[0];
        return {
            name: '',
            type: defaultType?.name as BungalowType || BungalowType.Standard,
            status: BungalowStatus.Available,
            capacity: defaultType?.capacity || 2,
            pricePerNight: defaultType?.defaultPrice || 10000,
            amenities: [] as string[], // Default to empty array (no amenities selected)
            imageUrl: '',
            description: '',
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (bungalow) {
            setFormData({
                name: bungalow.name,
                type: bungalow.type,
                status: bungalow.status,
                capacity: bungalow.capacity,
                pricePerNight: bungalow.pricePerNight,
                amenities: bungalow.amenities, // Use the existing array of amenities
                imageUrl: bungalow.imageUrl,
                description: bungalow.description,
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [bungalow, isOpen, settings.bungalows.types]);
    
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTypeName = e.target.value;
        const selectedTypeData = settings.bungalows.types.find(t => t.name === selectedTypeName);
        
        setFormData(prev => ({
            ...prev,
            type: selectedTypeName as BungalowType,
            capacity: selectedTypeData?.capacity || prev.capacity,
            pricePerNight: selectedTypeData?.defaultPrice || prev.pricePerNight,
            // Keep amenities as they are when changing type, as per request
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'type') {
            handleTypeChange(e as React.ChangeEvent<HTMLSelectElement>);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: (type === 'number') ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleAmenityChange = (amenityName: string) => {
        setFormData(prev => {
            const currentAmenities = prev.amenities;
            if (currentAmenities.includes(amenityName)) {
                return { ...prev, amenities: currentAmenities.filter(a => a !== amenityName) };
            } else {
                return { ...prev, amenities: [...currentAmenities, amenityName] };
            }
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bungalowToSave: Bungalow = {
            id: bungalow?.id || '', // id is set in parent for new bungalows
            name: formData.name,
            type: formData.type,
            status: formData.status,
            capacity: formData.capacity,
            pricePerNight: formData.pricePerNight,
            amenities: formData.amenities,
            imageUrl: formData.imageUrl,
            description: formData.description,
        };
        onSave(bungalowToSave);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={bungalow ? 'Modifier le bungalow' : 'Ajouter un bungalow'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </>
            }
        >
            <form className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du bungalow</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={`mt-1 ${commonInputStyle}`} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className={`mt-1 ${commonInputStyle}`}>
                            {settings.bungalows.types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className={`mt-1 ${commonInputStyle}`}>
                             {(Object.values(BungalowStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacité</label>
                        <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleChange} required min="1" className={`mt-1 ${commonInputStyle}`} />
                    </div>
                    <div>
                        <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix / nuit</label>
                        <input type="number" name="pricePerNight" id="pricePerNight" value={formData.pricePerNight} onChange={handleChange} required min="0" className={`mt-1 ${commonInputStyle}`} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipements</label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 border border-gray-200 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                        {(settings.bungalows.allAmenities || []).map(amenity => (
                            <div key={amenity.id} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id={`amenity-${amenity.id}`}
                                        name={amenity.name}
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity.name)}
                                        onChange={() => handleAmenityChange(amenity.name)}
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={`amenity-${amenity.id}`} className="font-medium text-gray-700 dark:text-gray-300">{amenity.name}</label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                    <ImageUpload
                        value={formData.imageUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                    />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className={`mt-1 ${commonInputStyle}`} />
                </div>

            </form>
        </Modal>
    );
};

export default BungalowFormModal;