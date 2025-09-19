// components/bungalows/BungalowCard.tsx
import React, { useState } from 'react';
import { Bungalow, BungalowStatus } from '../../types';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';

interface BungalowCardProps {
  bungalow: Bungalow;
  onEdit: (bungalow: Bungalow) => void;
  onDelete: (bungalowId: string) => void;
  onUpdateBungalow: (bungalow: Bungalow) => void; // For quick status/data changes
}

const BungalowCard: React.FC<BungalowCardProps> = ({ bungalow, onEdit, onDelete, onUpdateBungalow }) => {
    const { hasPermission, settings } = useAuth();
    const canUpdate = hasPermission('bungalows:update');
    const canDelete = hasPermission('bungalows:delete');
    const canUpdateStatus = hasPermission('bungalows:update_status');
    const [newAmenity, setNewAmenity] = useState('');

    const getStatusBadgeColor = (status: BungalowStatus): 'green' | 'red' | 'blue' | 'yellow' | 'gray' => {
        switch (status) {
            case BungalowStatus.Available: return 'green';
            case BungalowStatus.Occupied: return 'red';
            case BungalowStatus.Cleaning: return 'blue';
            case BungalowStatus.Maintenance: return 'yellow';
            default: return 'gray';
        }
    };

    const getStatusIndicatorColor = (status: BungalowStatus): string => {
        switch (status) {
            case BungalowStatus.Available: return 'bg-green-500';
            case BungalowStatus.Occupied: return 'bg-red-500';
            case BungalowStatus.Cleaning: return 'bg-blue-500';
            case BungalowStatus.Maintenance: return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };
    
    const handleStatusChange = (newStatus: BungalowStatus) => {
        onUpdateBungalow({ ...bungalow, status: newStatus });
    };

    const handleAddAmenity = () => {
        if (newAmenity.trim() && !bungalow.amenities.includes(newAmenity.trim())) {
            const updatedAmenities = [...bungalow.amenities, newAmenity.trim()];
            onUpdateBungalow({ ...bungalow, amenities: updatedAmenities });
            setNewAmenity('');
        }
    };

    const handleRemoveAmenity = (amenityToRemove: string) => {
        const updatedAmenities = bungalow.amenities.filter(a => a !== amenityToRemove);
        onUpdateBungalow({ ...bungalow, amenities: updatedAmenities });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
            <img className="w-full h-48 object-cover" src={bungalow.imageUrl} alt={bungalow.name} />
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getStatusIndicatorColor(bungalow.status)}`}></span>
                        <span>{bungalow.name}</span>
                    </h3>
                    <Badge color={getStatusBadgeColor(bungalow.status)}>{bungalow.status}</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{bungalow.type} - {bungalow.capacity} personnes</p>
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-300 flex-grow">{bungalow.description}</p>
                
                {/* Amenities Section */}
                <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Équipements</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {bungalow.amenities.map(amenity => (
                            <span key={amenity} className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {amenity}
                                {canUpdate && (
                                    <button onClick={() => handleRemoveAmenity(amenity)} className="ml-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none">
                                        &times;
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                    {canUpdate && (
                        <div className="mt-3 flex items-center gap-2">
                             <input
                                type="text"
                                value={newAmenity}
                                onChange={(e) => setNewAmenity(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); }}}
                                placeholder="Nouvel équipement..."
                                className="flex-grow w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <button onClick={handleAddAmenity} className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Ajouter</button>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {bungalow.pricePerNight.toLocaleString('fr-FR')} {settings.financial.currency} / nuit
                    </p>
                </div>
            </div>
            {(canUpdate || canDelete || canUpdateStatus) && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-between items-center">
                     <div className="flex space-x-2">
                        {canUpdate && <button onClick={() => onEdit(bungalow)} className="text-sm font-medium text-primary-600 hover:text-primary-800">Modifier</button>}
                        {canDelete && <button onClick={() => onDelete(bungalow.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Supprimer</button>}
                    </div>
                     <select 
                        value={bungalow.status} 
                        onChange={(e) => handleStatusChange(e.target.value as BungalowStatus)}
                        disabled={!canUpdateStatus}
                        className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 disabled:opacity-50"
                    >
                         {(Object.values(BungalowStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
};

export default BungalowCard;