import React from 'react';
import { Bungalow } from '../../types';
import BungalowCard from './BungalowCard';

interface BungalowCatalogueProps {
  bungalows: Bungalow[];
  onEdit: (bungalow: Bungalow) => void;
  onDelete: (bungalowId: string) => void;
  onUpdateBungalow: (bungalow: Bungalow) => void;
}

const BungalowCatalogue: React.FC<BungalowCatalogueProps> = ({ bungalows, onEdit, onDelete, onUpdateBungalow }) => {
  if (bungalows.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun bungalow trouvé</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Essayez d'ajuster vos filtres de recherche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {bungalows.map((bungalow) => (
        <BungalowCard 
            key={bungalow.id} 
            bungalow={bungalow}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateBungalow={onUpdateBungalow}
        />
      ))}
    </div>
  );
};

export default BungalowCatalogue;