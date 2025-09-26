// components/pages/UsersPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import UserCreationSuccessModal from '../users/UserCreationSuccessModal';
import { getVisibleUsers } from '../../constants';

const UsersPage: React.FC = () => {
    const { currentUser, allUsers, fetchUsers, addUser, updateUser, deleteUser, hasPermission, loadingUsers } = useAuth();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newUserCredentials, setNewUserCredentials] = useState({ email: '', temporaryPassword: '' });

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const visibleUsers = useMemo(() => getVisibleUsers(currentUser, allUsers), [currentUser, allUsers]);

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            await deleteUser(selectedUser.id);
            setDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };
    
    const handleSaveUser = async (user: Partial<User>, password?: string) => {
        if (user.id) { // Editing existing user
            await updateUser(user);
        } else { // Adding new user
            if (password) {
                const result = await addUser(user, password);
                if (result.success && result.tempPass) {
                    setNewUserCredentials({ email: user.email || '', temporaryPassword: result.tempPass });
                    setSuccessModalOpen(true);
                }
            }
        }
        setFormModalOpen(false);
        setSelectedUser(null);
    };
    
    const canWrite = hasPermission('users:write');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Ajoutez, modifiez et gérez les comptes des utilisateurs.
                    </p>
                </div>
                {canWrite && (
                    <Button onClick={handleAddUser}>
                        Ajouter un utilisateur
                    </Button>
                )}
            </div>
            
            {loadingUsers ? (
                <div className="text-center py-12">Chargement des utilisateurs...</div>
            ) : (
                <UserTable users={visibleUsers} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            )}

            {isFormModalOpen && (
                <UserFormModal 
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveUser}
                    user={selectedUser}
                />
            )}
            
            {isDeleteModalOpen && selectedUser && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Supprimer l'utilisateur"
                    message={`Êtes-vous sûr de vouloir supprimer ${selectedUser.name} ? Cette action est irréversible.`}
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
