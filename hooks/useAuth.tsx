// hooks/useAuth.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Permission, Settings, UserRole, UserStatus, Currency, BungalowType, RoleSetting, RolePermissions, PricingAdjustmentType } from '../types';

const MOCK_ROLES: RoleSetting[] = [
    {
        roleName: UserRole.Admin,
        permissions: {
            'bungalows:read': true, 'bungalows:create': true, 'bungalows:update': true, 'bungalows:update_status': true, 'bungalows:delete': true,
            'reservations:read': true, 'reservations:write': true,
            'clients:read': true, 'clients:write': true,
            'maintenance:read': true, 'maintenance:write': true,
            'reports:read': true, 'reports:write': true,
            'users:read': true, 'users:write': true,
            'settings:read': true, 'settings:write': true,
            'billing:read': true, 'billing:write': true,
        }
    },
    {
        roleName: UserRole.Manager,
        permissions: {
            'bungalows:read': true, 'bungalows:create': true, 'bungalows:update': true, 'bungalows:update_status': true, 'bungalows:delete': false,
            'reservations:read': true, 'reservations:write': true,
            'clients:read': true, 'clients:write': true,
            'maintenance:read': true, 'maintenance:write': true,
            'reports:read': true, 'reports:write': false,
            'billing:read': true, 'billing:write': true,
            'users:read': true, 'users:write': false,
            'settings:read': true, 'settings:write': false,
        }
    },
    {
        roleName: UserRole.Employee,
        permissions: {
            'bungalows:read': true, 'bungalows:create': false, 'bungalows:update': false, 'bungalows:update_status': true, 'bungalows:delete': false,
            'reservations:read': true, 'reservations:write': false,
            'clients:read': true, 'clients:write': false,
            'maintenance:read': true, 'maintenance:write': false,
            'reports:read': false, 'reports:write': false,
            'billing:read': true, 'billing:write': false,
            'users:read': false, 'users:write': false,
            'settings:read': false, 'settings:write': false,
        }
    }
];

const getPermissionsForRole = (role: UserRole): Permission[] => {
    const roleSetting = MOCK_ROLES.find(r => r.roleName === role);
    if (!roleSetting) return [];
    return Object.entries(roleSetting.permissions)
        .filter(([, hasPermission]) => hasPermission)
        .map(([permission]) => permission as Permission);
};

// MOCK DATA
const MOCK_CURRENT_USER: User = {
    id: 'user-admin',
    name: 'Admin Admin',
    email: 'admin@bungalow.dz',
    phone: '0555123456',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    role: UserRole.Admin,
    status: UserStatus.Active,
    permissions: getPermissionsForRole(UserRole.Admin),
    lastLogin: new Date().toISOString(),
    isOnline: true,
};

const MOCK_ALL_USERS: User[] = [
    MOCK_CURRENT_USER,
    {
        id: 'user-manager',
        name: 'Marie Manager',
        email: 'marie.m@bungalow.dz',
        avatarUrl: 'https://i.pravatar.cc/150?u=manager',
        role: UserRole.Manager,
        status: UserStatus.Active,
        permissions: getPermissionsForRole(UserRole.Manager),
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isOnline: false,
    },
    {
        id: 'user-employee',
        name: 'Eric Employé',
        email: 'eric.e@bungalow.dz',
        avatarUrl: 'https://i.pravatar.cc/150?u=employee',
        role: UserRole.Employee,
        status: UserStatus.Inactive,
        permissions: getPermissionsForRole(UserRole.Employee),
        lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        isOnline: false,
    }
];

const MOCK_SETTINGS: Settings = {
    general: {
        complexName: 'Bungalow.dz',
        logoUrl: '/logo.svg', // Assuming a logo in public folder
        bungalowCount: 12,
    },
    financial: {
        currency: Currency.DZD,
        fiscalInfo: {
            NIF: '123456789012345',
            NIS: '1234567890123456',
            RC: '16/00-1234567 A 23',
            AI: '123456789012345'
        },
        pricingRules: [
            {
                id: 'rule-weekend',
                name: 'Majoration Week-end',
                adjustmentType: PricingAdjustmentType.PercentageIncrease,
                value: 20, // +20%
                daysOfWeek: [5, 6], // Friday, Saturday
                bungalowTypeIds: [], // Applies to all types
            },
            {
                id: 'rule-weekday-discount',
                name: 'Réduction Semaine',
                adjustmentType: PricingAdjustmentType.PercentageDiscount,
                value: 10, // -10%
                daysOfWeek: [0, 1, 2, 3, 4], // Sunday to Thursday
                bungalowTypeIds: ['type-1', 'type-2'], // Only for Standard and Deluxe
            },
            {
                id: 'rule-summer',
                name: 'Haute Saison (Juillet-Août)',
                adjustmentType: PricingAdjustmentType.PercentageIncrease,
                value: 30, // +30%
                startDate: `${new Date().getFullYear()}-07-01`,
                endDate: `${new Date().getFullYear()}-08-31`,
                bungalowTypeIds: [], // Applies to all
            }
        ]
    },
    bungalows: {
        types: [
            { id: 'type-1', name: BungalowType.Standard, capacity: 2, defaultPrice: 10000, amenities: ['Wi-Fi', 'Climatisation'], description: 'Simple et confortable.' },
            { id: 'type-2', name: BungalowType.Deluxe, capacity: 2, defaultPrice: 15000, amenities: ['Wi-Fi', 'Climatisation', 'Vue sur mer'], description: 'Plus d\'espace et une vue magnifique.' },
            { id: 'type-3', name: BungalowType.Suite, capacity: 4, defaultPrice: 25000, amenities: ['Wi-Fi', 'Climatisation', 'Jacuzzi', 'Service de chambre'], description: 'Luxe et confort absolus.' },
            { id: 'type-4', name: BungalowType.Family, capacity: 6, defaultPrice: 20000, amenities: ['Wi-Fi', 'Climatisation', 'Cuisine équipée'], description: 'Idéal pour les familles.' },
        ],
        allAmenities: [
            { id: 'amenity-1', name: 'Wi-Fi' },
            { id: 'amenity-2', name: 'Climatisation' },
            { id: 'amenity-3', name: 'Vue sur mer' },
            { id: 'amenity-4', name: 'Cuisine équipée' },
            { id: 'amenity-5', name: 'Jacuzzi privé' },
            { id: 'amenity-6', name: 'Service de chambre' },
            { id: 'amenity-7', name: 'Mini-bar' },
            { id: 'amenity-8', name: 'Terrasse privée' },
        ]
    },
    security: {
        passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
        },
        twoFactorAuth: {
            enforced: false,
        }
    },
    roles: MOCK_ROLES,
    loyalty: {
        enabled: true,
        pointsPerNight: 10,
        pointsForFirstReservation: 50,
    },
};

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    settings: Settings;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    updateUser: (user: User) => void;
    updateSettings: (newSettings: Settings) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(MOCK_CURRENT_USER);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_ALL_USERS);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);

    const hasPermission = (permission: Permission | Permission[]): boolean => {
        if (!currentUser) return false;
        const userPermissions = new Set(currentUser.permissions);
        if (Array.isArray(permission)) {
            return permission.every(p => userPermissions.has(p));
        }
        return userPermissions.has(permission);
    };

    const updateUser = (updatedUser: User) => {
        setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };
    
    const updateSettings = (newSettings: Settings) => {
        // Propagate role changes to all users if roles have been updated
        if (JSON.stringify(newSettings.roles) !== JSON.stringify(settings.roles)) {
            const rolePermsMap = new Map(newSettings.roles.map(r => [r.roleName, r.permissions]));

            const updatedUsers = allUsers.map(user => {
                const newPermsObject = rolePermsMap.get(user.role);
                if (newPermsObject) {
                    const userPermissions = Object.entries(newPermsObject)
                        .filter(([, hasPerm]) => hasPerm)
                        .map(([perm]) => perm as Permission);
                    return { ...user, permissions: userPermissions };
                }
                return user;
            });
            setAllUsers(updatedUsers);

            // Also update current user's permissions if they are logged in
            if (currentUser) {
                const newPermsObject = rolePermsMap.get(currentUser.role);
                if (newPermsObject) {
                    const userPermissions = Object.entries(newPermsObject)
                        .filter(([, hasPerm]) => hasPerm)
                        .map(([perm]) => perm as Permission);
                    setCurrentUser(prev => prev ? { ...prev, permissions: userPermissions } : null);
                }
            }
        }
        
        setSettings(newSettings);
        console.log("Settings updated:", newSettings);
    };

    const value = {
        currentUser,
        allUsers,
        settings,
        hasPermission,
        updateUser,
        updateSettings
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};