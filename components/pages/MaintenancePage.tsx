// components/pages/MaintenancePage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { MaintenanceRequest, MaintenanceStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToasts } from '../../hooks/useToasts';
import Button from '../ui/Button';
import MaintenanceTable from '../maintenance/MaintenanceTable';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import { getVisibleUsers } from '../../constants';

const MaintenancePage: React.FC = () => {
    const { currentUser, allUsers, fetchUsers, hasPermission, loadingUsers } = useAuth();
    const { 
        maintenanceRequests, bungalows, 
        fetchMaintenanceRequests, fetchBungalows,
        addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest,
        isLoading: isDataLoading
    } = useData();
    const { addToast } = useToasts();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    useEffect(() => {
        fetchMaintenanceRequests();
        fetchBungalows();
        fetchUsers();
    }, [fetchMaintenanceRequests, fetchBungalows, fetchUsers]);

    const bungalowMap = useMemo(() => new Map(bungalows.map(b => [b.id, b.name])), [bungalows]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);
    const assignableUsers = getVisibleUsers(currentUser, allUsers);
    
    const filteredRequests = useMemo(() => {
        return maintenanceRequests.filter(req => 
            statusFilter === 'all' || req.status === statusFilter
        );
    }, [maintenanceRequests, statusFilter]);

    const canWrite = hasPermission('maintenance:write');

    const handleAddRequest = () => {
        setSelectedRequest(null);
        setFormModalOpen(true);
    };

    const handleEditRequest = (request: MaintenanceRequest) => {
        setSelectedRequest(request);
        setFormModalOpen(true);
    };

    const handleDeleteRequest = (requestId: string) => {
        const requestToDelete = maintenanceRequests.find(r => r.id === requestId);
        if (requestToDelete) {
            setSelectedRequest(requestToDelete);
            setDeleteModalOpen(true);
        }
    };
    
    const confirmDelete = async () => {
        if (selectedRequest) {
            await deleteMaintenanceRequest(selectedRequest.id);
            addToast({ message: `Demande de maintenance supprimée.`, type: 'success' });
            setDeleteModalOpen(false);
            setSelectedRequest(null);
        }
    };
    
    const handleSaveRequest = async (requestData: MaintenanceRequest) => {
        if (selectedRequest) { // Editing
            await updateMaintenanceRequest({ ...selectedRequest, ...requestData });
            addToast({ message: 'Demande de maintenance mise à jour.', type: 'success' });
        } else { // Adding
            await addMaintenanceRequest(requestData);
            addToast({ message: 'Nouvelle demande de maintenance ajoutée.', type: 'success' });
        }
        setFormModalOpen(false);
        setSelectedRequest(null);
    };

    const isLoading = isDataLoading.maintenanceRequests || isDataLoading.bungalows || loadingUsers;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Suivez et gérez toutes les demandes d'intervention et de maintenance.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddRequest}>
                        Nouvelle Demande
                    </Button>
                )}
            </div>

            <div className="mb-6">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="all">Tous les statuts</option>
                    {(Object.values(MaintenanceStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            {isLoading ? (
                <div className="text-center py-12">Chargement des demandes...</div>
            ) : (
                <MaintenanceTable 
                    requests={filteredRequests}
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

            {isDeleteModalOpen && selectedRequest && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Supprimer la demande"
                    message={`Êtes-vous sûr de vouloir supprimer cette demande de maintenance ?`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default MaintenancePage;
