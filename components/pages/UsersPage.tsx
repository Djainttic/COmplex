import React, { useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserTable from '../users/UserTable';
import UserFormModal from '../users/UserFormModal';
import AuditLogModal from '../users/AuditLogModal';
import Button from '../ui/Button';
import { getVisibleUsers } from '../../constants';

const UsersPage: React.FC = () => {
    const { currentUser, hasPermission, allUsers, updateUser } = useAuth();
    // Local state for modals
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isAuditModalOpen, setAuditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const visibleUsers = getVisibleUsers(currentUser, allUsers);

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormModalOpen(true);
    };

    const handleViewAuditLog = (user: User) => {
        setSelectedUser(user);
        setAuditModalOpen(true);
    };
    
    const handleDeleteUser = (userId: string) => {
        // In a real app, this would be an API call and then update state
        // For now, we filter out the user, but this is not persisted in the context
        console.warn("Delete functionality is not fully implemented in the mock context.");
    };

    const handleSaveUser = (user: User) => {
        if (selectedUser) {
            // Edit existing user
            updateUser(user);
        } else {
            // Add new user - NOTE: In a real app, API would return the new user with ID
            const newUser = { ...user, id: (Math.random() * 1000).toString(), avatarUrl: `https://i.pravatar.cc/150?u=${user.name}` };
            // This part is tricky without a proper backend/state management for adding users.
            // For now, we'll just log it. A proper implementation would add it to the `allUsers` in the context.
            console.log("Adding new user (simulation):", newUser);
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
                onDelete={handleDeleteUser}
                onViewAuditLog={handleViewAuditLog}
            />

            {isFormModalOpen && (
                <UserFormModal 
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveUser}
                    user={selectedUser}
                />
            )}

            {isAuditModalOpen && selectedUser && (
                <AuditLogModal 
                    isOpen={isAuditModalOpen}
                    onClose={() => setAuditModalOpen(false)}
                    user={selectedUser}
                />
            )}
        </div>
    );
};

export default UsersPage;