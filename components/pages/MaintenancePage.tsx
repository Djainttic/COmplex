import React, { useState, useMemo } from 'react';
import { MaintenanceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import MaintenanceTable from '../maintenance/MaintenanceTable';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';
import Button from '../ui/Button';

const MaintenancePage: React.FC = () => {
    const { hasPermission, allUsers } = useAuth();
    const { 
        maintenanceRequests, addMaintenanceRequest, 
        updateMaintenanceRequest, deleteMaintenanceRequest, 
        bungalows 
    } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    
    const canWrite = hasPermission('maintenance:write');

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

    const handleDeleteRequest = (requestId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette demande de maintenance ?")) {
            deleteMaintenanceRequest(requestId);
        }
    };

    const handleSaveRequest = (requestToSave: MaintenanceRequest) => {
        if (selectedRequest) { // Editing
            updateMaintenanceRequest(requestToSave);
        } else { // Adding
            const newRequest: MaintenanceRequest = {
                ...requestToSave,
                id: `maint-${Date.now()}`,
                createdDate: new Date().toISOString(),
            };
            addMaintenanceRequest(newRequest);
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
                    users={allUsers}
                />
            )}
        </div>
    );
};

export default MaintenancePage;
