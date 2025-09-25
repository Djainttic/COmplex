import React from 'react';
import { User, UserStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../ui/Badge';
import { formatDateDDMMYYYY } from '../../constants';
import AuditLogModal from './AuditLogModal';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
    const { hasPermission, currentUser } = useAuth();
    const [isAuditModalOpen, setAuditModalOpen] = React.useState(false);
    const [selectedUserForLog, setSelectedUserForLog] = React.useState<User | null>(null);

    const canWrite = hasPermission('users:write');

    const handleViewAuditLog = (user: User) => {
        setSelectedUserForLog(user);
        setAuditModalOpen(true);
    };

    const getStatusBadgeColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Active: return 'green';
            case UserStatus.Inactive: return 'gray';
            case UserStatus.PendingActivation: return 'yellow';
            default: return 'gray';
        }
    };
    
    return (
        <>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Utilisateur</th>
                                <th scope="col" className="px-6 py-3">Rôle</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Dernière connexion</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="relative">
                                            <img className="w-10 h-10 rounded-full" src={user.avatarUrl} alt={`${user.name} avatar`} />
                                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        </div>
                                        <div className="pl-3">
                                            <div className="text-base font-semibold">{user.name}</div>
                                            <div className="font-normal text-gray-500">{user.email}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{user.role}</td>
                                    <td className="px-6 py-4">
                                        <Badge color={getStatusBadgeColor(user.status)}>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatDateDDMMYYYY(user.lastLogin)}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleViewAuditLog(user)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Logs</button>
                                        {canWrite && (
                                            <>
                                                <button onClick={() => onEdit(user)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Modifier</button>
                                                {/* Prevent admin from deleting themselves */}
                                                {currentUser?.id !== user.id && (
                                                    <button onClick={() => onDelete(user)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAuditModalOpen && selectedUserForLog && (
                <AuditLogModal 
                    isOpen={isAuditModalOpen}
                    onClose={() => setAuditModalOpen(false)}
                    user={selectedUserForLog}
                />
            )}
        </>
    );
};

export default UserTable;