import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RoleSetting, UserRole, Permission } from '../../types';
import Button from '../ui/Button';

const PERMISSION_GROUPS: { [key: string]: Permission[] } = {
    'Gestion des Bungalows': ['bungalows:read', 'bungalows:create', 'bungalows:update', 'bungalows:update_status', 'bungalows:delete'],
    'Gestion des Réservations': ['reservations:read', 'reservations:write'],
    'Gestion des Clients': ['clients:read', 'clients:write'],
    'Facturation': ['billing:read', 'billing:write'],
    'Fidélité': ['loyalty:read', 'loyalty:write'],
    'Communication': ['communication:read', 'communication:write'],
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
    const { settings, updateSettings, hasPermission, currentUser } = useAuth();
    const canWrite = hasPermission('settings:write');
    const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

    const [rolesConfig, setRolesConfig] = useState<RoleSetting[]>(
        JSON.parse(JSON.stringify(settings.roles)) // Deep copy
    );

    const handlePermissionChange = (roleName: UserRole, permission: Permission, isEnabled: boolean) => {
        setRolesConfig(prevConfig =>
            prevConfig.map(role => {
                if (role.roleName === roleName) {
                    return { 
                        ...role, 
                        permissions: { ...role.permissions, [permission]: isEnabled }
                    };
                }
                return role;
            })
        );
    };

    const handleToggleGroup = (roleName: UserRole, groupPermissions: Permission[]) => {
        setRolesConfig(prevConfig =>
            prevConfig.map(role => {
                if (role.roleName === roleName) {
                    const updatedPermissions = { ...role.permissions };
                    const allEnabled = groupPermissions.every(p => updatedPermissions[p]);
                    groupPermissions.forEach(p => {
                        updatedPermissions[p] = !allEnabled;
                    });
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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Gestion des Rôles et Permissions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Activez ou désactivez l'accès aux modules pour chaque rôle. Le Super Administrateur a un accès complet non modifiable.
                </p>
                {isSuperAdmin && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">
                            En tant que Super Administrateur, vous pouvez modifier les permissions de tous les autres rôles, y compris le rôle Administrateur.
                        </p>
                    </div>
                )}
            </div>
            
            <div className="space-y-6">
                {rolesConfig
                    .filter(role => role.roleName !== UserRole.SuperAdmin)
                    .map(role => {
                        const isRoleEditable = canWrite;

                        return (
                            <div key={role.roleName} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h4 className="text-lg font-semibold text-primary-700 dark:text-primary-400">{role.roleName}</h4>
                                
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
                                        const allChecked = permissions.every(p => role.permissions[p]);
                                        return (
                                            <fieldset key={groupName}>
                                                <div className="flex justify-between items-center border-b dark:border-gray-600 pb-2 mb-2">
                                                    <legend className="text-sm font-medium text-gray-900 dark:text-white">{groupName}</legend>
                                                    {isRoleEditable && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleToggleGroup(role.roleName, permissions)} 
                                                            className="text-xs font-medium text-primary-600 hover:underline focus:outline-none"
                                                        >
                                                            {allChecked ? 'Tout décocher' : 'Tout cocher'}
                                                        </button>
                                                    )}
                                                </div>
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
                                                                        disabled={!isRoleEditable}
                                                                        checked={role.permissions[permission] || false}
                                                                        onChange={(e) => handlePermissionChange(role.roleName, permission, e.target.checked)}
                                                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                                                    />
                                                                </div>
                                                                <div className="ml-3 text-sm">
                                                                    <label htmlFor={`${role.roleName}-${permission}`} className={`font-medium ${!isRoleEditable ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                        {PERMISSION_LABELS[permType] || permType}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </fieldset>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {canWrite && (
                <div className="pt-2 text-right">
                    <Button type="submit">Enregistrer les permissions</Button>
                </div>
            )}
        </form>
    );
};

export default RolesSettingsForm;