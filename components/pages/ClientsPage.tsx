import React, { useState } from 'react';
import { Client } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import ClientTable from '../clients/ClientTable';
import ClientFormModal from '../clients/ClientFormModal';
import Button from '../ui/Button';

const ClientsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { clients, addClient, updateClient, deleteClient } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const canWrite = hasPermission('clients:write');

    const handleAddClient = () => {
        setSelectedClient(null);
        setModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setModalOpen(true);
    };

    const handleDeleteClient = async (clientId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ? Toutes les réservations et factures associées pourraient être affectées.")) {
            const result = await deleteClient(clientId);
            if (!result.success) {
                alert(`Erreur lors de la suppression du client : ${result.error?.message || 'Erreur inconnue'}`);
            }
        }
    };

    const handleSaveClient = async (clientToSave: Client) => {
        let result;
        if (clientToSave.id) { // Editing
            result = await updateClient(clientToSave);
        } else { // Adding
            const newClient: Partial<Client> = {
                ...clientToSave,
                registrationDate: new Date().toISOString(),
                loyaltyPoints: 0,
            };
            result = await addClient(newClient);
        }
        
        if (result.success) {
            setModalOpen(false);
            setSelectedClient(null);
        } else {
            alert(`Erreur lors de la sauvegarde du client : ${result.error?.message || 'Erreur inconnue'}`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Clients</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Consultez, ajoutez et gérez les fiches de vos clients.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddClient}>
                        Ajouter un client
                    </Button>
                )}
            </div>
            
            <ClientTable 
                clients={clients}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
            />

            {isModalOpen && (
                <ClientFormModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveClient}
                    client={selectedClient}
                />
            )}
        </div>
    );
};

export default ClientsPage;