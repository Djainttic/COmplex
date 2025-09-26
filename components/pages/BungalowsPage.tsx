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
    
    const handleDeleteBungalow = async (bungalowId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bungalow ?")) {
            await deleteBungalow(bungalowId);
        }
    };

    const handleSaveBungalow = async (bungalowDataFromModal: Bungalow) => {
        if (bungalowDataFromModal.id) { // Editing
            await updateBungalow(bungalowDataFromModal);
        } else { // Adding
            // Explicitly create the object for Supabase, omitting the empty 'id' field.
            // This ensures Supabase can generate a new ID without conflicts.
            const { id, ...newBungalowData } = bungalowDataFromModal;
            const result = await addBungalow(newBungalowData);
            if (result.error) {
                // If there's an error, show it to the user.
                console.error("Failed to add bungalow:", result.error);
                alert(`Erreur lors de l'ajout du bungalow : ${result.error.message}`);
                // Don't close the modal on error
                return; 
            }
        }
        setModalOpen(false);
        setSelectedBungalow(null);
    };
    
    // For quick status updates from the card
    const handleUpdateBungalow = async (updatedBungalow: Bungalow) => {
        await updateBungalow(updatedBungalow);
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
                {/* FIX: Corrected permission string from 'bungalow:create' to 'bungalows:create' to match the Permission type. */}
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