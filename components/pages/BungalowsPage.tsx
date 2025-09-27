// components/pages/BungalowsPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Bungalow } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToasts } from '../../hooks/useToasts';
import Button from '../ui/Button';
import BungalowFilters from '../bungalows/BungalowFilters';
import BungalowCatalogue from '../bungalows/BungalowCatalogue';
import BungalowFormModal from '../bungalows/BungalowFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';

const BungalowsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { bungalows, fetchBungalows, addBungalow, updateBungalow, deleteBungalow, isLoading } = useData();
    const { addToast } = useToasts();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBungalow, setSelectedBungalow] = useState<Bungalow | null>(null);
    const [filters, setFilters] = useState({ status: '', type: '', capacity: 0 });

    useEffect(() => {
        fetchBungalows();
    }, [fetchBungalows]);

    const filteredBungalows = useMemo(() => {
        return bungalows.filter(b => 
            (filters.status ? b.status === filters.status : true) &&
            (filters.type ? b.type === filters.type : true) &&
            (filters.capacity > 0 ? b.capacity >= filters.capacity : true)
        );
    }, [bungalows, filters]);

    const canWrite = hasPermission(['bungalows:create', 'bungalows:update', 'bungalows:delete']);

    const handleAddBungalow = () => {
        setSelectedBungalow(null);
        setFormModalOpen(true);
    };

    const handleEditBungalow = (bungalow: Bungalow) => {
        setSelectedBungalow(bungalow);
        setFormModalOpen(true);
    };

    const handleDeleteBungalow = (bungalowId: string) => {
        const bungalowToDelete = bungalows.find(b => b.id === bungalowId);
        if (bungalowToDelete) {
            setSelectedBungalow(bungalowToDelete);
            setDeleteModalOpen(true);
        }
    };
    
    const confirmDelete = async () => {
        if (selectedBungalow) {
            const success = await deleteBungalow(selectedBungalow.id);
            if (success) {
                addToast({ message: `Le bungalow ${selectedBungalow.name} a été supprimé.`, type: 'success' });
                setDeleteModalOpen(false);
                setSelectedBungalow(null);
            } else {
                 addToast({ message: `Échec de la suppression du bungalow.`, type: 'error' });
            }
        }
    };

    const handleSaveBungalow = async (bungalowData: Bungalow) => {
        let success = false;
        if (selectedBungalow) { // Editing
            success = await updateBungalow({ ...selectedBungalow, ...bungalowData });
            if(success) addToast({ message: `Le bungalow ${bungalowData.name} a été mis à jour.`, type: 'success' });
        } else { // Adding
            success = await addBungalow(bungalowData);
            if(success) addToast({ message: `Le bungalow ${bungalowData.name} a été ajouté.`, type: 'success' });
        }

        if (success) {
            setFormModalOpen(false);
            setSelectedBungalow(null);
        } else {
            addToast({ message: "Échec de l'opération. Veuillez vérifier les informations et réessayer.", type: 'error' });
        }
    };
    
    const handleFilterChange = useCallback((newFilters: { status: string; type: string; capacity: number }) => {
        setFilters(newFilters);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalogue des Bungalows</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Consultez et gérez l'ensemble de vos bungalows.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddBungalow}>
                        Ajouter un bungalow
                    </Button>
                )}
            </div>
            
            <BungalowFilters onFilterChange={handleFilterChange} />
            
            {isLoading.bungalows ? (
                 <div className="text-center py-12">Chargement des bungalows...</div>
            ) : (
                <BungalowCatalogue 
                    bungalows={filteredBungalows} 
                    onEdit={handleEditBungalow}
                    onDelete={handleDeleteBungalow}
                    onUpdateBungalow={updateBungalow}
                />
            )}

            {isFormModalOpen && (
                 <BungalowFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveBungalow}
                    bungalow={selectedBungalow}
                />
            )}

            {isDeleteModalOpen && selectedBungalow && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Supprimer le bungalow"
                    message={`Êtes-vous sûr de vouloir supprimer le bungalow "${selectedBungalow.name}" ?`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default BungalowsPage;