import React, { useState, useMemo, useEffect } from 'react';
import { MaintenanceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import MaintenanceTable from '../maintenance/MaintenanceTable';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';
import Button from '../ui/Button';
import { getVisibleUsers } from '../../constants';

const MaintenancePage: React.FC = () => {
    const { currentUser, hasPermission, allUsers, fetchUsers, loadingUsers } = useAuth();
    const { 
        maintenanceRequests, addMaintenanceRequest, 
        updateMaintenanceRequest, deleteMaintenanceRequest, 
        bungalows, fetchMaintenanceRequests, fetchBungalows, isLoading: isDataLoading
    } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    
    const canWrite = hasPermission('maintenance:write');

    useEffect(() => {
        fetchMaintenanceRequests();
        fetchBungalows();
        fetchUsers();
    }, [fetchMaintenanceRequests, fetchBungalows, fetchUsers]);
    
    const assignableUsers = getVisibleUsers(currentUser, allUsers);
    const bungalowMap = useMemo(() => new Map(bungalows.map(b => [b.id, b.name])), [bungalows]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const handleAddRequest = () => {
        setSelectedRequest(null);
        setModalOpen(true);
    };

    const handleEditRequest = (request: MaintenanceRequest) => {
        setSelectedRequest(request);
        setModalOpen(true);
    };

    const handleDeleteRequest = async (requestId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette demande de maintenance ?")) {
            const result = await deleteMaintenanceRequest(requestId);
            if (!result.success) {
                alert(`Erreur lors de la suppression : ${result.error?.message || 'Erreur inconnue'}`);
            }
        }
    };

    const handleSaveRequest = async (requestToSave: MaintenanceRequest) => {
        let result;
        if (requestToSave.id) {
            result = await updateMaintenanceRequest(requestToSave);
        } else {
            const newRequest: Partial<MaintenanceRequest> = {
                ...requestToSave,
                createdDate: new Date().toISOString(),
            };
            result = await addMaintenanceRequest(newRequest);
        }
        
        if (result.success) {
            setModalOpen(false);
            setSelectedRequest(null);
        } else {
             alert(`Erreur lors de la sauvegarde : ${result.error?.message || 'Erreur inconnue'}`);
        }
    };
    
    const showLoading = (isDataLoading.maintenanceRequests || isDataLoading.bungalows || loadingUsers) && maintenanceRequests.length === 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion de la Maintenance</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Suivez et gérez les demandes d'intervention sur le complexe.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddRequest}>
                        Nouvelle demande
                    </Button>
                )}
            </div>

            {showLoading ? (
                <div className="text-center py-12">Chargement des demandes de maintenance...</div>
            ) : (
                <MaintenanceTable 
                    requests={maintenanceRequests}
                    bungalowMap={bungalowMap}
                    userMap={userMap}
                    onEdit={handleEditRequest}
                    onDelete={handleDeleteRequest}
                />
            )}

            {isModalOpen && (
                <MaintenanceFormModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveRequest}
                    request={selectedRequest}
                    bungalows={bungalows}
                    users={assignableUsers}
                />
            )}
        </div>
    );
};

export default MaintenancePage;
