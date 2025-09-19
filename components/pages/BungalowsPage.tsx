import React, { useState, useMemo } from 'react';
import { Bungalow } from '../../types';
import BungalowFilters from '../bungalows/BungalowFilters';
import BungalowCatalogue from '../bungalows/BungalowCatalogue';
import BungalowFormModal from '../bungalows/BungalowFormModal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

const BungalowsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { bungalows, addBungalow, updateBungalow, deleteBungalow } = useData();
    const [filters, setFilters] = useState({ status: '', type: '', capacity: 0 });
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBungalow, setSelectedBungalow] = useState<Bungalow | null>(null);

    const handleFilterChange = (newFilters: { status: string; type: string; capacity: number }) => {
        setFilters(newFilters);
    };

    const handleAddBungalow = () => {
        setSelectedBungalow(null);
        setModalOpen(true);
    };

    const handleEditBungalow = (bungalow: Bungalow) => {
        setSelectedBungalow(bungalow);
        setModalOpen(true);
    };
    
    const handleDeleteBungalow = (bungalowId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bungalow ?")) {
            deleteBungalow(bungalowId);
        }
    };

    const handleSaveBungalow = (bungalowToSave: Bungalow) => {
        if (selectedBungalow) { // Editing
            updateBungalow(bungalowToSave);
        } else { // Adding
            const newBungalow = { ...bungalowToSave, id: `bungalow-${Date.now()}` };
            addBungalow(newBungalow);
        }
        setModalOpen(false);
        setSelectedBungalow(null);
    };
    
    // For quick status updates from the card
    const handleUpdateBungalow = (updatedBungalow: Bungalow) => {
        updateBungalow(updatedBungalow);
    };

    const filteredBungalows = useMemo(() => {
        return bungalows.filter(b => {
            const statusMatch = filters.status ? b.status === filters.status : true;
            const typeMatch = filters.type ? b.type === filters.type : true;
            const capacityMatch = filters.capacity > 0 ? b.capacity >= filters.capacity : true;
            return statusMatch && typeMatch && capacityMatch;
        });
    }, [bungalows, filters]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalogue des Bungalows</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Consultez, ajoutez et gérez vos bungalows.
                    </p>
                </div>
                {hasPermission('bungalows:create') && (
                    <Button onClick={handleAddBungalow}>
                        Ajouter un bungalow
                    </Button>
                )}
            </div>
            
            <BungalowFilters onFilterChange={handleFilterChange} />

            <BungalowCatalogue 
                bungalows={filteredBungalows}
                onEdit={handleEditBungalow}
                onDelete={handleDeleteBungalow}
                onUpdateBungalow={handleUpdateBungalow}
            />

            {isModalOpen && (
                <BungalowFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveBungalow}
                    bungalow={selectedBungalow}
                />
            )}
        </div>
    );
};

export default BungalowsPage;