import React, { useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import UserCreationSuccessModal from '../users/UserCreationSuccessModal';
import Button from '../ui/Button';
import { getVisibleUsers } from '../../constants';

const UsersPage: React.FC = () => {
    const { currentUser, hasPermission, allUsers, updateUser, addUser, deleteUser } = useAuth();
    
    // State for modals
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [newUserCreds, setNewUserCreds] = useState<{ email: string, temporaryPassword: string } | null>(null);

    const visibleUsers = getVisibleUsers(currentUser, allUsers);

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormModalOpen(true);
    };
    
    const handleDeleteRequest = (user: User) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
        }
        setDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleSaveUser = (user: User) => {
        if (selectedUser) {
            // Edit existing user
            updateUser(user);
        } else {
            // Add new user
            const newUser = addUser({
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
            });
            setNewUserCreds({ email: newUser.email, temporaryPassword: 'password123' });
            setSuccessModalOpen(true);
        }
        setFormModalOpen(false);
        setSelectedUser(null);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Gérez les comptes, les rôles et les permissions.
                    </p>
                </div>
                {hasPermission('users:write') && (
                    <Button onClick={handleAddUser}>
                        Ajouter un utilisateur
                    </Button>
                )}
            </div>
            
            <UserTable 
                users={visibleUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteRequest}
            />

            {isFormModalOpen && (
                <UserFormModal 
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveUser}
                    user={selectedUser}
                />
            )}

            {isDeleteModalOpen && userToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDeleteUser}
                    title="Confirmer la suppression"
                    message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.name} ? Cette action est irréversible.`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            )}
            
            {isSuccessModalOpen && newUserCreds && (
                <UserCreationSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setSuccessModalOpen(false)}
                    credentials={newUserCreds}
                />
            )}
        </div>
    );
};

export default UsersPage;