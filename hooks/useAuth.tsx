// hooks/useAuth.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { User, Settings, UserRole, UserStatus, Permission, RoleSetting, Currency, BungalowType, PricingAdjustmentType } from '../types';

// This is a simplified mock of a backend.
const MOCK_USERS: User[] = [
    { id: 'user-superadmin', name: 'Djalal TTL', email: 'djalalttl@bungalow.dz', role: UserRole.SuperAdmin, status: UserStatus.Active, avatarUrl: 'https://i.ibb.co/2d9y22T/syphax-logo.png', lastLogin: new Date().toISOString(), isOnline: true, permissions: [] },
    { id: 'user-admin', name: 'Admin Syphax', email: 'admin_syphax@bungalow.dz', role: UserRole.Admin, status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/admin/200', lastLogin: new Date().toISOString(), isOnline: true, permissions: [] },
    { id: 'user-manager', name: 'Fatima Manager', email: 'manager@bungalow.dz', role: UserRole.Manager, status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/manager/200', lastLogin: new Date().toISOString(), isOnline: false, permissions: [] },
    { id: 'user-employee', name: 'Karim Employé', email: 'employee@bungalow.dz', role: UserRole.Employee, status: UserStatus.Active, avatarUrl: 'https://picsum.photos/seed/employee/200', lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isOnline: true, permissions: [] },
];

const DEFAULT_SETTINGS: Settings = {
    general: {
        complexName: 'SYPHAX, village touristique',
        logoUrl: 'https://i.ibb.co/2d9y22T/syphax-logo.png',
        bungalowCount: 6,
    },
    financial: {
        currency: Currency.DZD,
        fiscalInfo: { RC: 'RC/ALGER/2024/A/12345', NIF: '001234567890123' },
        pricingRules: [
            { id: 'rule-1', name: 'Weekend Surcharge', adjustmentType: PricingAdjustmentType.PercentageIncrease, value: 20, daysOfWeek: [5, 6], bungalowTypeIds: [] },
            { id: 'rule-2', name: 'Summer High Season', adjustmentType: PricingAdjustmentType.FixedIncrease, value: 5000, bungalowTypeIds: [], startDate: '2024-07-01', endDate: '2024-08-31' },
        ],
    },
    security: {
        passwordPolicy: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: false },
        twoFactorAuth: { enforced: false },
    },
    bungalows: {
        types: [
            { id: 'type-1', name: BungalowType.Standard, capacity: 2, defaultPrice: 10000, amenities: ['Wi-Fi'], description: 'Simple et confortable.' },
            { id: 'type-2', name: BungalowType.Luxe, capacity: 2, defaultPrice: 15000, amenities: ['Wi-Fi', 'Climatisation', 'Vue sur mer'], description: 'Luxe et vue imprenable.' },
            { id: 'type-3', name: BungalowType.Familial, capacity: 4, defaultPrice: 18000, amenities: ['Wi-Fi', 'Climatisation', 'Cuisine'], description: 'Spacieux pour les familles.' },
            { id: 'type-4', name: BungalowType.Suite, capacity: 2, defaultPrice: 25000, amenities: ['Wi-Fi', 'Climatisation', 'Jacuzzi'], description: 'Le meilleur du confort.' },
        ],
        allAmenities: [
            { id: 'amenity-1', name: 'Wi-Fi' }, { id: 'amenity-2', name: 'Climatisation' }, { id: 'amenity-3', name: 'Vue sur mer' }, { id: 'amenity-4', name: 'Cuisine équipée' }, { id: 'amenity-5', name: 'Jacuzzi' }, { id: 'amenity-6', name: '2 Chambres' },
        ],
        automation: { enableAutoCleaning: true }
    },
    roles: [
        { roleName: UserRole.SuperAdmin, permissions: {} }, // SuperAdmin permissions are hardcoded to all
        { roleName: UserRole.Admin, permissions: { 'bungalows:read': true, 'bungalows:create': true, 'bungalows:update': true, 'bungalows:delete': true, 'bungalows:update_status': true, 'reservations:read': true, 'reservations:write': true, 'clients:read': true, 'clients:write': true, 'billing:read': true, 'billing:write': true, 'loyalty:read': true, 'loyalty:write': true, 'communication:read': true, 'communication:write': true, 'maintenance:read': true, 'maintenance:write': true, 'reports:read': true, 'reports:write': true, 'users:read': true, 'users:write': true, 'settings:read': true, 'settings:write': true } },
        { roleName: UserRole.Manager, permissions: { 'bungalows:read': true, 'bungalows:update_status': true, 'reservations:read': true, 'reservations:write': true, 'clients:read': true, 'clients:write': true, 'billing:read': true, 'maintenance:read': true, 'maintenance:write': true, 'reports:read': true } },
        { roleName: UserRole.Employee, permissions: { 'bungalows:read': true, 'bungalows:update_status': true, 'reservations:read': true, 'maintenance:read': true } },
    ],
    moduleStatus: { // true by default
        'bungalows': true, 'reservations': true, 'clients': true, 'facturation': true, 'fidelite': true, 'communication': true, 'maintenance': true, 'rapports': true, 'utilisateurs': true,
    },
    loyalty: { enabled: true, pointsPerNight: 10, pointsForFirstReservation: 50, pointsToCurrencyValue: 5 },
    license: { key: 'SYPHAX-PRO-2024-DEMO-XXXX', status: 'Active', expiresOn: '2025-12-31T23:59:59Z' },
};


// Helper to get user from localStorage
const getInitialUser = (): User | null => {
    try {
        const item = window.localStorage.getItem('currentUser');
        return item ? JSON.parse(item) : null;
    } catch (error) {
        return null;
    }
};

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (user: User) => void;
    addUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    settings: Settings;
    updateSettings: (newSettings: Settings) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);

    const login = async (email: string, pass: string): Promise<boolean> => {
        // This is a mock login. In a real app, you'd call an API.
        // For this demo, we ignore the password and only check if the user exists.
        const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setCurrentUser(user);
            window.localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        window.localStorage.removeItem('currentUser');
    };

    const updateUser = (user: User) => {
        setAllUsers(prev => prev.map(u => u.id === user.id ? user : u));
        if (currentUser?.id === user.id) {
            setCurrentUser(user);
            window.localStorage.setItem('currentUser', JSON.stringify(user));
        }
    };
    
    const addUser = (user: User) => {
        setAllUsers(prev => [...prev, user]);
    };

    const deleteUser = (userId: string) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
    };

    const updateSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        // In a real app, you'd save this to a backend.
    };

    const hasPermission = useMemo(() => (requiredPermission: Permission | Permission[]): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === UserRole.SuperAdmin) return true;

        const roleSettings = settings.roles.find(r => r.roleName === currentUser.role);
        if (!roleSettings) return false;
        
        const permissionsToCheck = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

        return permissionsToCheck.every(p => roleSettings.permissions[p]);

    }, [currentUser, settings.roles]);


    const value = {
        currentUser,
        allUsers,
        login,
        logout,
        updateUser,
        addUser,
        deleteUser,
        hasPermission,
        settings,
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