import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RoleSetting, UserRole, Permission, RolePermissions } from '../../types';
import Button from '../ui/Button';

const PERMISSION_GROUPS: { [key: string]: Permission[] } = {
    'Gestion des Bungalows': ['bungalows:read', 'bungalows:create', 'bungalows:update', 'bungalows:update_status', 'bungalows:delete'],
    'Gestion des Réservations': ['reservations:read', 'reservations:write'],
    'Gestion des Clients': ['clients:read', 'clients:write'],
    'Facturation': ['billing:read', 'billing:write'],
    'Maintenance': ['maintenance:read', 'maintenance:write'],
    'Rapports': ['reports:read', 'reports:write'],
    'Gestion des Utilisateurs': ['users:read', 'users:write'],
    'Paramètres': ['settings:read', 'settings:write'],
};

const PERMISSION_LABELS: { [key: string]: string } = {
    'read': 'Lecture',
    'write': 'Écriture',
    'create': 'Création',
    'update': 'Modification',
    'update_status': 'Changement de statut',
    'delete': 'Suppression',
};

const RolesSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');

    const [rolesConfig, setRolesConfig] = useState<RoleSetting[]>(
        JSON.parse(JSON.stringify(settings.roles)) // Deep copy
    );

    const handlePermissionChange = (roleName: UserRole, permission: Permission, isEnabled: boolean) => {
        setRolesConfig(prevConfig =>
            prevConfig.map(role => {
                if (role.roleName === roleName) {
                    const updatedPermissions: RolePermissions = {
                        ...role.permissions,
                        [permission]: isEnabled,
                    };
                    return { ...role, permissions: updatedPermissions };
                }
                return role;
            })
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, roles: rolesConfig });
        alert('Les permissions des rôles ont été mises à jour.');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Gestion des Rôles et Permissions</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Activez ou désactivez l'accès aux modules pour chaque rôle. Le rôle Administrateur a un accès complet non modifiable.
                    </p>
                </div>
                
                <div className="space-y-10">
                    {rolesConfig.map(role => (
                        <div key={role.roleName} className="border-t dark:border-gray-700 pt-6">
                            <h4 className="text-base font-semibold text-primary-700 dark:text-primary-400">{role.roleName}</h4>
                            {role.roleName === UserRole.Admin ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ce rôle dispose de toutes les permissions et ne peut pas être modifié.</p>
                            ) : (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                                        <fieldset key={groupName}>
                                            <legend className="text-sm font-medium text-gray-900 dark:text-white">{groupName}</legend>
                                            <div className="mt-2 space-y-2">
                                                {permissions.map(permission => {
                                                    const permType = permission.split(':')[1] as keyof typeof PERMISSION_LABELS;
                                                    return (
                                                    <div key={permission} className="relative flex items-start">
                                                        <div className="flex items-center h-5">
                                                            <input
                                                                id={`${role.roleName}-${permission}`}
                                                                name={`${role.roleName}-${permission}`}
                                                                type="checkbox"
                                                                disabled={!canWrite}
                                                                checked={role.permissions[permission] || false}
                                                                onChange={(e) => handlePermissionChange(role.roleName, permission, e.target.checked)}
                                                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                                            />
                                                        </div>
                                                        <div className="ml-3 text-sm">
                                                            <label htmlFor={`${role.roleName}-${permission}`} className="font-medium text-gray-700 dark:text-gray-300">
                                                                {PERMISSION_LABELS[permType] || permType}
                                                            </label>
                                                        </div>
                                                    </div>
                                                )})}
                                            </div>
                                        </fieldset>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {canWrite && (
                <div className="pt-8 text-right">
                    <Button type="submit">Enregistrer les permissions</Button>
                </div>
            )}
        </form>
    );
};

export default RolesSettingsForm;