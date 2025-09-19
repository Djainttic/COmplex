import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BungalowTypeSetting, AmenitySetting } from '../../types';
import Button from '../ui/Button';
import BungalowTypeFormModal from './BungalowTypeFormModal';
import BungalowAmenityFormModal from './BungalowAmenityFormModal';

const BungalowSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');

    // Local state to manage bungalow settings edits
    const [bungalowSettings, setBungalowSettings] = useState(settings.bungalows);

    // Modal states
    const [isTypeModalOpen, setTypeModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<BungalowTypeSetting | null>(null);
    const [isAmenityModalOpen, setAmenityModalOpen] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState<AmenitySetting | null>(null);

    // Handlers for Bungalow Types
    const handleAddType = () => {
        setSelectedType(null);
        setTypeModalOpen(true);
    };

    const handleEditType = (type: BungalowTypeSetting) => {
        setSelectedType(type);
        setTypeModalOpen(true);
    };

    const handleSaveType = (typeToSave: BungalowTypeSetting) => {
        setBungalowSettings(prev => {
            const existing = prev.types.find(t => t.id === typeToSave.id);
            if (existing) {
                return { ...prev, types: prev.types.map(t => t.id === typeToSave.id ? typeToSave : t) };
            }
            return { ...prev, types: [...prev.types, typeToSave] };
        });
        setTypeModalOpen(false);
    };
    
    const handleDeleteType = (typeId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type ? Cela pourrait affecter les bungalows existants.")) {
            setBungalowSettings(prev => ({...prev, types: prev.types.filter(t => t.id !== typeId) }));
        }
    };
    
    // Handlers for Amenities
    const handleAddAmenity = () => {
        setSelectedAmenity(null);
        setAmenityModalOpen(true);
    };

    const handleEditAmenity = (amenity: AmenitySetting) => {
        setSelectedAmenity(amenity);
        setAmenityModalOpen(true);
    };
    
    const handleSaveAmenity = (amenityToSave: AmenitySetting) => {
        setBungalowSettings(prev => {
             const existing = prev.allAmenities.find(a => a.id === amenityToSave.id);
             if (existing) {
                return { ...prev, allAmenities: prev.allAmenities.map(a => a.id === amenityToSave.id ? amenityToSave : a) };
             }
             return { ...prev, allAmenities: [...prev.allAmenities, amenityToSave] };
        });
        setAmenityModalOpen(false);
    };
    
    const handleDeleteAmenity = (amenityId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ? Il sera retiré de tous les bungalows.")) {
           setBungalowSettings(prev => ({...prev, allAmenities: prev.allAmenities.filter(a => a.id !== amenityId)}));
        }
    };
    
    const handleAutomationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setBungalowSettings(prev => ({
            ...prev,
            automation: { ...prev.automation, enableAutoCleaning: checked }
        }));
    };
    
    // Main form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, bungalows: bungalowSettings });
        alert("Paramètres des bungalows mis à jour !");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Types Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Types de Bungalow</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez les différents types de bungalows que vous proposez.</p>
                    </div>
                    {canWrite && <Button type="button" onClick={handleAddType}>Ajouter un type</Button>}
                </div>
                <div className="mt-4 flow-root">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {bungalowSettings.types.map(type => (
                            <li key={type.id} className="py-4 flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{type.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{type.capacity} personnes - {type.defaultPrice} {settings.financial.currency}/nuit</p>
                                </div>
                                {canWrite && (
                                    <div className="ml-4 flex-shrink-0 space-x-2">
                                        <button type="button" onClick={() => handleEditType(type)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Modifier</button>
                                        <button type="button" onClick={() => handleDeleteType(type.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             {/* Automation Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Automatisation des Statuts</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Simplifiez la gestion en automatisant les changements de statut.
                    </p>
                </div>
                <div className="mt-4 relative flex items-start">
                    <div className="flex items-center h-5">
                         <input id="enableAutoCleaning" name="enableAutoCleaning" type="checkbox"
                            checked={bungalowSettings.automation.enableAutoCleaning}
                            onChange={handleAutomationChange}
                            disabled={!canWrite}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enableAutoCleaning" className="font-medium text-gray-700 dark:text-gray-300">Activer le passage automatique en "Nettoyage" après le départ d'un client</label>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                           Quand une réservation se termine, si le bungalow est "Occupé", il passera automatiquement en "Nettoyage".
                         </p>
                    </div>
                </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Équipements</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez la liste de tous les équipements disponibles.</p>
                    </div>
                    {canWrite && <Button type="button" onClick={handleAddAmenity}>Ajouter un équipement</Button>}
                </div>
                <div className="mt-4 flow-root">
                     <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {bungalowSettings.allAmenities.map(amenity => (
                            <li key={amenity.id} className="py-3 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{amenity.name}</p>
                                {canWrite && (
                                    <div className="ml-4 flex-shrink-0 space-x-2">
                                        <button type="button" onClick={() => handleEditAmenity(amenity)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Modifier</button>
                                        <button type="button" onClick={() => handleDeleteAmenity(amenity.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            )}
            
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
        </form>
    );
};

export default BungalowSettingsForm;