// components/settings/RolesSettingsForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToasts } from '../../hooks/useToasts';
import { RoleSetting, UserRole, Permission, PermissionsMap } from '../../types';
import Button from '../ui/Button';

const PERMISSION_GROUPS = {
    'Bungalows': ['bungalows:read', 'bungalows:create', 'bungalows:update', 'bungalows:delete', 'bungalows:update_status'],
    'Réservations': ['reservations:read', 'reservations:write'],
    'Clients': ['clients:read', 'clients:write'],
    'Facturation': ['billing:read', 'billing:write'],
    'Fidélité': ['loyalty:read', 'loyalty:write'],
    'Communication': ['communication:read', 'communication:write'],
    'Maintenance': ['maintenance:read', 'maintenance:write'],
    'Rapports': ['reports:read', 'reports:write'],
    'Utilisateurs': ['users:read', 'users:write'],
    'Paramètres': ['settings:read', 'settings:write'],
};

const PERMISSION_LABELS: { [key in Permission]: string } = {
    'bungalows:read': 'Voir',
    'bungalows:create': 'Créer',
    'bungalows:update': 'Modifier',
    'bungalows:delete': 'Supprimer',
    'bungalows:update_status': 'Changer Statut',
    'reservations:read': 'Voir',
    'reservations:write': 'Gérer',
    'clients:read': 'Voir',
    'clients:write': 'Gérer',
    'billing:read': 'Voir',
    'billing:write': 'Gérer',
    'loyalty:read': 'Voir',
    'loyalty:write': 'Gérer',
    'communication:read': 'Voir',
    'communication:write': 'Gérer',
    'maintenance:read': 'Voir',
    'maintenance:write': 'Gérer',
    'reports:read': 'Voir',
    'reports:write': 'Gérer',
    'users:read': 'Voir',
    'users:write': 'Gérer',
    'settings:read': 'Voir',
    'settings:write': 'Gérer',
};


const RolesSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const { addToast } = useToasts();
    const [roles, setRoles] = useState<RoleSetting[]>(settings.roles);
    const canWrite = hasPermission('settings:write');
    
    const handlePermissionChange = (roleName: UserRole, permission: Permission, value: boolean) => {
        setRoles(prevRoles =>
            prevRoles.map(role =>
                role.roleName === roleName
                    ? { ...role, permissions: { ...role.permissions, [permission]: value } }
                    : role
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings({ ...settings, roles });
        addToast({ message: 'Rôles et permissions mis à jour.', type: 'success' });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Permission
                            </th>
                            {roles.map(role => (
                                <th key={role.roleName} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {role.roleName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                            <React.Fragment key={groupName}>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <td colSpan={roles.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-900 dark:text-white">{groupName}</td>
                                </tr>
                                {permissions.map(p => (
                                    <tr key={p}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{PERMISSION_LABELS[p as Permission]}</td>
                                        {roles.map(role => (
                                            <td key={role.roleName} className="px-6 py-4 whitespace-nowrap text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!role.permissions[p as Permission]}
                                                    onChange={(e) => handlePermissionChange(role.roleName, p as Permission, e.target.checked)}
                                                    disabled={!canWrite || role.roleName === UserRole.SuperAdmin}
                                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            )}
        </form>
    );
};

export default RolesSettingsForm;
