// components/pages/UsersPage.tsx
import React, { useState, useMemo } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import UserCreationSuccessModal from '../users/UserCreationSuccessModal';
import { getVisibleUsers } from '../../constants';

const UsersPage: React.FC = () => {
    const { currentUser, allUsers, addUser, updateUser, deleteUser, hasPermission } = useAuth();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [newUserCredentials, setNewUserCredentials] = useState({ email: '', temporaryPassword: '' });
    
    const canWrite = hasPermission('users:write');

    const visibleUsers = useMemo(() => {
        // FIX: Replaced inline filtering logic with the centralized getVisibleUsers helper function.
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
            await deleteUser(userToDelete.id);
        }
        setConfirmModalOpen(false);
        setUserToDelete(null);
    };
    
    const generateTempPassword = () => `pass_${Math.random().toString(36).substring(2, 10)}`;

    const handleSaveUser = async (userToSave: Partial<User>) => {
        if (userToSave.id) { // Editing existing user
            await updateUser(userToSave as User);
        } else { // Adding new user
            const temporaryPassword = generateTempPassword();
            const newUser = await addUser(userToSave, temporaryPassword);

            if (newUser) {
                setNewUserCredentials({ email: newUser.email, temporaryPassword });
                setSuccessModalOpen(true);
            }
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
            
            {isSuccessModalOpen && (
                <UserCreationSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setSuccessModalOpen(false)}
                    credentials={newUserCredentials}
                />
            )}
        </div>
    );
};

export default UsersPage;
