// components/pages/ClientsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Client } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Button from '../ui/Button';
import ClientTable from '../clients/ClientTable';
import ClientFormModal from '../clients/ClientFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';

const ClientsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { clients, addClient, updateClient, deleteClient, fetchClients, isLoading } = useData();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);
    
    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lowercasedFilter = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.name.toLowerCase().includes(lowercasedFilter) ||
            client.email.toLowerCase().includes(lowercasedFilter)
        );
    }, [clients, searchTerm]);

    const handleAddClient = () => {
        setSelectedClient(null);
        setFormModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setFormModalOpen(true);
    };

    const handleDeleteClient = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClient(client);
            setDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (selectedClient) {
            await deleteClient(selectedClient.id);
            setDeleteModalOpen(false);
            setSelectedClient(null);
        }
    };
    
    const handleSaveClient = async (client: Client) => {
        if (client.id) {
            await updateClient(client);
        } else {
            await addClient(client);
        }
        setFormModalOpen(false);
        setSelectedClient(null);
    };
    
    const canWrite = hasPermission('clients:write');
    const showLoading = isLoading.clients && clients.length === 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Clients</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Consultez et gérez les informations de vos clients.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddClient}>
                        Ajouter un client
                    </Button>
                )}
            </div>

            <div className="mb-6">
                <input
                    type="search"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            
            {showLoading ? (
                <div className="text-center py-12">Chargement des clients...</div>
            ) : (
                <ClientTable 
                    clients={filteredClients} 
                    onEdit={handleEditClient} 
                    onDelete={handleDeleteClient} 
                />
            )}
            
            {isFormModalOpen && (
                <ClientFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveClient}
                    client={selectedClient}
                />
            )}

            {isDeleteModalOpen && selectedClient && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Supprimer le client"
                    message={`Êtes-vous sûr de vouloir supprimer ${selectedClient.name} ? Toutes les données associées (réservations, factures) seront conservées mais ce client sera supprimé.`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default ClientsPage;
