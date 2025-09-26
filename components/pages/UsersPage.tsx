// components/pages/UsersPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import { getVisibleUsers } from '../../constants';
import UserCreationSuccessModal from '../users/UserCreationSuccessModal';

const UsersPage: React.FC = () => {
    const { currentUser, allUsers, addUser, updateUser, deleteUser, hasPermission, fetchUsers, loadingUsers } = useAuth();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [newUserCredentials, setNewUserCredentials] = useState({ email: '', temporaryPassword: '' });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    
    const canWrite = hasPermission('users:write');

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
                // The UI will update via realtime subscription
            } else {
                alert(`Erreur lors de la suppression : ${result.error?.message || 'Erreur inconnue'}`);
            }
        }
        setConfirmModalOpen(false);
        setUserToDelete(null);
    };
    
    const handleSaveUser = async (userToSave: Partial<User>, password?: string) => {
        let result;
        if (userToSave.id) {
            result = await updateUser(userToSave as User);
        } else if (password) {
            result = await addUser(userToSave, password);
            if (result.success && result.data?.email) {
                setNewUserCredentials({ email: result.data.email, temporaryPassword: password });
                setSuccessModalOpen(true);
            }
        } else {
            alert("Erreur : Un mot de passe est requis pour créer un nouvel utilisateur.");
            return;
        }

        if (result.success) {
            setFormModalOpen(false);
            setSelectedUser(null);
        } else {
            alert(`Erreur lors de la sauvegarde : ${result.error?.message || 'Une erreur inconnue est survenue.'}`);
        }
    };

    if (loadingUsers && allUsers.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        );
    }

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
            
            {isSuccessModalOpen && (
                <UserCreationSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setSuccessModalOpen(false)}
                    credentials={newUserCredentials}
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
