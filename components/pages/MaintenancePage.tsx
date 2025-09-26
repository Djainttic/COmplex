// components/pages/MaintenancePage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { MaintenanceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import MaintenanceTable from '../maintenance/MaintenanceTable';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';
import Button from '../ui/Button';
import { getVisibleUsers } from '../../constants';

const MaintenancePage: React.FC = () => {
    const { currentUser, allUsers, fetchUsers, hasPermission, loadingUsers } = useAuth();
    const { 
        maintenanceRequests, bungalows,
        fetchMaintenanceRequests, fetchBungalows,
        addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest,
        isLoading: isDataLoading
    } = useData();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

    useEffect(() => {
        fetchMaintenanceRequests();
        fetchBungalows();
        fetchUsers();
    }, [fetchMaintenanceRequests, fetchBungalows, fetchUsers]);

    const handleAddRequest = () => {
        setSelectedRequest(null);
        setFormModalOpen(true);
    };

    const handleEditRequest = (request: MaintenanceRequest) => {
        setSelectedRequest(request);
        setFormModalOpen(true);
    };
    
    const handleDeleteRequest = async (requestId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
            await deleteMaintenanceRequest(requestId);
        }
    };

    const handleSaveRequest = async (request: MaintenanceRequest) => {
        if (request.id) {
            await updateMaintenanceRequest(request);
        } else {
            await addMaintenanceRequest(request);
        }
        setFormModalOpen(false);
        setSelectedRequest(null);
    };

    const bungalowMap = useMemo(() => new Map(bungalows.map(b => [b.id, b.name])), [bungalows]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);
    
    const assignableUsers = useMemo(() => getVisibleUsers(currentUser, allUsers), [currentUser, allUsers]);

    const canWrite = hasPermission('maintenance:write');
    const isLoading = isDataLoading.maintenanceRequests || isDataLoading.bungalows || loadingUsers;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Suivez et gérez les demandes de maintenance pour vos bungalows.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddRequest}>
                        Nouvelle demande
                    </Button>
                )}
            </div>

            {isLoading ? (
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
            
            {isFormModalOpen && (
                <MaintenanceFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
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
