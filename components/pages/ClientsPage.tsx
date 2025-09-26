// components/pages/ClientsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Client } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToasts } from '../../hooks/useToasts';
import Button from '../ui/Button';
import ClientTable from '../clients/ClientTable';
import ClientFormModal from '../clients/ClientFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';

const ClientsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { clients, fetchClients, addClient, updateClient, deleteClient, isLoading } = useData();
    const { addToast } = useToasts();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const canWrite = hasPermission('clients:write');

    const handleAddClient = () => {
        setSelectedClient(null);
        setFormModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setFormModalOpen(true);
    };

    const handleDeleteClient = (clientId: string) => {
        const clientToDelete = clients.find(c => c.id === clientId);
        if(clientToDelete) {
            setSelectedClient(clientToDelete);
            setDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (selectedClient) {
            await deleteClient(selectedClient.id);
            addToast({ message: `Le client ${selectedClient.name} a été supprimé.`, type: 'success' });
            setDeleteModalOpen(false);
            setSelectedClient(null);
        }
    };

    const handleSaveClient = async (clientData: Client) => {
        if (selectedClient) { // Editing
            await updateClient({ ...selectedClient, ...clientData });
            addToast({ message: `Le client ${clientData.name} a été mis à jour.`, type: 'success' });
        } else { // Adding
            await addClient(clientData);
            addToast({ message: `Le client ${clientData.name} a été ajouté.`, type: 'success' });
        }
        setFormModalOpen(false);
        setSelectedClient(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Clients</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Consultez et gérez votre base de données clients.
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
                    placeholder="Rechercher un client par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            
            {isLoading.clients ? (
                 <div className="text-center py-12">Chargement des clients...</div>
            ) : (
                <ClientTable clients={filteredClients} onEdit={handleEditClient} onDelete={handleDeleteClient} />
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
                    message={`Êtes-vous sûr de vouloir supprimer ${selectedClient.name} ? Toutes les données associées (réservations, factures) seront conservées mais ce client sera retiré.`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default ClientsPage;
