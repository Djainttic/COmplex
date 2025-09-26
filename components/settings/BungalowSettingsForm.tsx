// components/settings/BungalowSettingsForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToasts } from '../../hooks/useToasts';
import { BungalowTypeSetting, AmenitySetting } from '../../types';
import Button from '../ui/Button';
import BungalowTypeFormModal from './BungalowTypeFormModal';
import BungalowAmenityFormModal from './BungalowAmenityFormModal';

const BungalowSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const canWrite = hasPermission('settings:write');

    const [isTypeModalOpen, setTypeModalOpen] = useState(false);
    const [isAmenityModalOpen, setAmenityModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<BungalowTypeSetting | null>(null);
    const [selectedAmenity, setSelectedAmenity] = useState<AmenitySetting | null>(null);

    const handleAddType = () => {
        setSelectedType(null);
        setTypeModalOpen(true);
    };

    const handleEditType = (type: BungalowTypeSetting) => {
        setSelectedType(type);
        setTypeModalOpen(true);
    };

    const handleSaveType = (type: BungalowTypeSetting) => {
        let updatedTypes;
        if (selectedType) {
            updatedTypes = settings.bungalows.types.map(t => t.id === type.id ? type : t);
        } else {
            updatedTypes = [...settings.bungalows.types, type];
        }
        updateSettings({ ...settings, bungalows: { ...settings.bungalows, types: updatedTypes } });
        addToast({ message: `Type "${type.name}" sauvegardé.`, type: 'success' });
        setTypeModalOpen(false);
    };
    
    const handleDeleteType = (typeId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type ?")) {
             const updatedTypes = settings.bungalows.types.filter(t => t.id !== typeId);
             updateSettings({ ...settings, bungalows: { ...settings.bungalows, types: updatedTypes } });
             addToast({ message: `Type supprimé.`, type: 'success' });
        }
    };
    
    const handleAddAmenity = () => {
        setSelectedAmenity(null);
        setAmenityModalOpen(true);
    };
    
    const handleEditAmenity = (amenity: AmenitySetting) => {
        setSelectedAmenity(amenity);
        setAmenityModalOpen(true);
    };

    const handleSaveAmenity = (amenity: AmenitySetting) => {
         let updatedAmenities;
        if (selectedAmenity) {
            updatedAmenities = settings.bungalows.allAmenities.map(a => a.id === amenity.id ? amenity : a);
        } else {
            updatedAmenities = [...settings.bungalows.allAmenities, amenity];
        }
        updateSettings({ ...settings, bungalows: { ...settings.bungalows, allAmenities: updatedAmenities } });
        addToast({ message: `Équipement "${amenity.name}" sauvegardé.`, type: 'success' });
        setAmenityModalOpen(false);
    };

    const handleDeleteAmenity = (amenityId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
            const updatedAmenities = settings.bungalows.allAmenities.filter(a => a.id !== amenityId);
            updateSettings({ ...settings, bungalows: { ...settings.bungalows, allAmenities: updatedAmenities } });
            addToast({ message: `Équipement supprimé.`, type: 'success' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Bungalow Types Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Types de Bungalow</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez les modèles de bungalows pour accélérer la création.</p>
                    </div>
                    {canWrite && <Button onClick={handleAddType}>Ajouter un type</Button>}
                </div>
                <div className="mt-6 flow-root">
                    <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                        {settings.bungalows.types.map(type => (
                            <li key={type.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{type.capacity} pers. - {type.defaultPrice} DZD/nuit</p>
                                </div>
                                {canWrite && (
                                    <div className="space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleEditType(type)}>Modifier</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteType(type.id)}>Supprimer</Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Équipements</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez la liste de tous les équipements disponibles.</p>
                    </div>
                    {canWrite && <Button onClick={handleAddAmenity}>Ajouter un équipement</Button>}
                </div>
                 <div className="mt-6 flow-root">
                    <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                        {settings.bungalows.allAmenities.map(amenity => (
                             <li key={amenity.id} className="py-3 flex items-center justify-between">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{amenity.name}</p>
                                {canWrite && (
                                    <div className="space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleEditAmenity(amenity)}>Modifier</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteAmenity(amenity.id)}>Supprimer</Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {isTypeModalOpen && (
                <BungalowTypeFormModal
                    isOpen={isTypeModalOpen}
                    onClose={() => setTypeModalOpen(false)}
                    onSave={handleSaveType}
                    bungalowType={selectedType}
                />
            )}
            
            {isAmenityModalOpen && (
                 <BungalowAmenityFormModal
                    isOpen={isAmenityModalOpen}
                    onClose={() => setAmenityModalOpen(false)}
                    onSave={handleSaveAmenity}
                    amenity={selectedAmenity}
                />
            )}
        </div>
    );
};

export default BungalowSettingsForm;
