// components/bungalows/BungalowCard.tsx
import React, { useState } from 'react';
import { Bungalow, BungalowStatus } from '../../types';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';

interface BungalowCardProps {
  bungalow: Bungalow;
  onEdit: (bungalow: Bungalow) => void;
  onDelete: (bungalowId: string) => void;
  onUpdateBungalow: (bungalow: Bungalow) => void;
}

const BungalowCard: React.FC<BungalowCardProps> = ({ bungalow, onEdit, onDelete, onUpdateBungalow }) => {
    const { hasPermission } = useAuth();
    const canUpdateStatus = hasPermission('bungalows:update_status');
    const canWrite = hasPermission(['bungalows:update', 'bungalows:delete']);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getStatusBadgeColor = (status: BungalowStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
        switch (status) {
            case BungalowStatus.Available: return 'green';
            case BungalowStatus.Occupied: return 'red';
            case BungalowStatus.Cleaning: return 'blue';
            case BungalowStatus.Maintenance: return 'yellow';
            default: return 'gray';
        }
    };
    
    const handleStatusChange = (newStatus: BungalowStatus) => {
        onUpdateBungalow({ ...bungalow, status: newStatus });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="relative">
                <img className="h-48 w-full object-cover" src={bungalow.imageUrl} alt={bungalow.name} />
                <div className="absolute top-2 right-2">
                    <Badge color={getStatusBadgeColor(bungalow.status)}>{bungalow.status}</Badge>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{bungalow.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{bungalow.type}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex-grow">{bungalow.description}</p>
                
                <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{bungalow.capacity} personnes</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{bungalow.pricePerNight} DZD / nuit</span>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                {canUpdateStatus && (
                     <select 
                        value={bungalow.status}
                        onChange={(e) => handleStatusChange(e.target.value as BungalowStatus)}
                        className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500"
                     >
                         {(Object.values(BungalowStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                )}
               
                {canWrite && (
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>
                        {isMenuOpen && (
                             <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                    <button onClick={() => { onEdit(bungalow); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Modifier</button>
                                    <button onClick={() => { onDelete(bungalow.id); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Supprimer</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BungalowCard;
