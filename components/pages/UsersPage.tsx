// components/pages/UsersPage.tsx
import React, { useState, useMemo } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import { getVisibleUsers } from '../../constants';

const UsersPage: React.FC = () => {
    const { currentUser, allUsers, addUser, updateUser, deleteUser, hasPermission } = useAuth();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    
    const canWrite = hasPermission('users:write');

    const visibleUsers = useMemo(() => {
        return getVisibleUsers(currentUser, allUsers);
    }, [currentUser, allUsers]);

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            const result = await deleteUser(userToDelete.id);
            if (result.success) {
                alert(`L'utilisateur ${userToDelete.name} a été supprimé.`);
            } else {
                alert(`Erreur lors de la suppression : ${result.error?.message || 'Erreur inconnue'}`);
            }
        }
        setConfirmModalOpen(false);
        setUserToDelete(null);
    };

    const handleSaveUser = async (userToSave: Partial<User>, password?: string) => {
        let result;
        if (userToSave.id) { // Editing existing user
            result = await updateUser(userToSave as User);
        } else if (password) { // Adding new user
            result = await addUser(userToSave, password);
        } else {
            console.error("Le mot de passe est manquant pour la création d'un nouvel utilisateur.");
            alert("Erreur : Un mot de passe est requis pour créer un nouvel utilisateur.");
            return;
        }

        if (result.success) {
            alert(userToSave.id ? "Utilisateur mis à jour avec succès !" : `L'utilisateur ${result.data?.name} a été créé avec succès.`);
            setFormModalOpen(false);
            setSelectedUser(null);
        } else {
            alert(`Erreur lors de la sauvegarde : ${result.error?.message || 'Une erreur inconnue est survenue.'}`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Ajoutez, modifiez et gérez les accès des utilisateurs de votre équipe.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddUser}>
                        Ajouter un utilisateur
                    </Button>
                )}
            </div>
            
            <UserTable 
                users={visibleUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
            />

            {isFormModalOpen && (
                <UserFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveUser}
                    user={selectedUser}
                />
            )}

            {isConfirmModalOpen && userToDelete && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirmer la suppression"
                    message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.name} ? Cette action est irréversible.`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default UsersPage;