import React, { useState, useMemo } from 'react';
import { MaintenanceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import MaintenanceTable from '../maintenance/MaintenanceTable';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';
import Button from '../ui/Button';
import { getVisibleUsers } from '../../constants';

const MaintenancePage: React.FC = () => {
    const { currentUser, hasPermission, allUsers } = useAuth();
    const { 
        maintenanceRequests, addMaintenanceRequest, 
        updateMaintenanceRequest, deleteMaintenanceRequest, 
        bungalows 
    } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    
    const canWrite = hasPermission('maintenance:write');
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
            await deleteMaintenanceRequest(requestId);
        }
    };

    const handleSaveRequest = async (requestToSave: MaintenanceRequest) => {
        if (requestToSave.id) { // Editing
            await updateMaintenanceRequest(requestToSave);
        } else { // Adding
            const newRequest: Partial<MaintenanceRequest> = {
                ...requestToSave,
                createdDate: new Date().toISOString(),
            };
            await addMaintenanceRequest(newRequest);
        }
        setModalOpen(false);
        setSelectedRequest(null);
    };

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
            
            <MaintenanceTable 
                requests={maintenanceRequests}
                bungalowMap={bungalowMap}
                userMap={userMap}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
            />

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