// components/pages/UsersPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToasts } from '../../hooks/useToasts';
import { getVisibleUsers } from '../../constants';
import Button from '../ui/Button';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import UserCreationSuccessModal from '../users/UserCreationSuccessModal';

const UsersPage: React.FC = () => {
    const { currentUser, allUsers, fetchUsers, addUser, updateUser, deleteUser, hasPermission, loadingUsers } = useAuth();
    const { addToast } = useToasts();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newUserCredentials, setNewUserCredentials] = useState({ email: '', temporaryPassword: '' });

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const visibleUsers = useMemo(() => getVisibleUsers(currentUser, allUsers), [currentUser, allUsers]);
    
    const canWrite = hasPermission('users:write');

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
            addToast({ message: `L'utilisateur ${selectedUser.name} a été supprimé.`, type: 'success' });
            setDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleSaveUser = async (userData: Partial<User>, password?: string) => {
        if (selectedUser) { // Editing existing user
            await updateUser({ ...selectedUser, ...userData });
            addToast({ message: `L'utilisateur ${userData.name} a été mis à jour.`, type: 'success' });
        } else { // Adding new user
            const result = await addUser(userData, password);
            if (result.success && result.user && result.tempPassword) {
                setNewUserCredentials({ email: result.user.email!, temporaryPassword: result.tempPassword });
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
                        Ajoutez, modifiez ou supprimez des utilisateurs et gérez leurs permissions.
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
