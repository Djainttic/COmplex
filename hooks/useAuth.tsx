// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Permission, RoleSetting, UserRole, UserStatus } from '../types';
import { MOCK_USERS, MOCK_SETTINGS, MOCK_ROLES } from '../lib/mockData';

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    settings: Settings;
    loading: boolean;
    loadingUsers: boolean;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    fetchUsers: () => Promise<void>;
    addUser: (userData: Partial<User>) => Promise<{ success: boolean; user?: User; tempPassword?: string; error?: string }>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    updateSettings: (newSettings: Settings) => Promise<void>;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    // FIX: Add missing methods for password reset functionality.
    sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // On initial app load, we are not logged in.
        setLoading(false);
        fetchUsers();
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true);
        await sleep(500); // Simulate network latency
        
        // Find user in our mock/runtime user list
        const user = allUsers.find(u => u.email === email);
        
        // For this mock app, we'll use a universal password.
        if (user && pass === 'password123') {
            setCurrentUser(user);
            setLoading(false);
            return { success: true };
        } else {
            setLoading(false);
            return { success: false, error: "Email ou mot de passe incorrect." };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        navigate('/login');
    };

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        await sleep(500); // Simulate API call
        setAllUsers(MOCK_USERS);
        setLoadingUsers(false);
    }, []);

    const addUser = async (userData: Partial<User>) => {
        await sleep(500);
        const tempPassword = 'password123'; // Standard password for all users
        
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || UserRole.Employee,
            status: userData.status || UserStatus.PendingActivation,
            avatarUrl: 'https://i.ibb.co/7j1g9qg/default-avatar.png',
            lastLogin: '',
            isOnline: false,
            permissions: MOCK_ROLES.find(r => r.roleName === userData.role)?.permissions ? Object.keys(MOCK_ROLES.find(r => r.roleName === userData.role)!.permissions).filter(p => MOCK_ROLES.find(r => r.roleName === userData.role)!.permissions[p as Permission]) as Permission[] : [],
            ...userData,
        };
        setAllUsers(prev => [...prev, newUser]);
        return { success: true, user: newUser, tempPassword };
    };

    const updateUser = async (userData: Partial<User>) => {
        await sleep(300);
        setAllUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
        if (currentUser?.id === userData.id) {
            setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
        }
    };
    
    const deleteUser = async (userId: string) => {
        await sleep(500);
        setAllUsers(prev => prev.filter(u => u.id !== userId));
    };

    const updateSettings = async (newSettings: Settings) => {
        setLoading(true);
        await sleep(500);
        setSettings(newSettings);
        setLoading(false);
    };

    const hasPermission = useCallback((permission: Permission | Permission[]): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === UserRole.SuperAdmin) return true; // SuperAdmin has all permissions
        const userPermissions = new Set(currentUser.permissions);

        if (Array.isArray(permission)) {
            return permission.every(p => userPermissions.has(p));
        }
        return userPermissions.has(permission);
    }, [currentUser]);

    // FIX: Implement mock password reset email function.
    const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
        await sleep(500); // Simulate network latency
        // In a real app, this would trigger a backend service to send an email.
        // For this mock app, we'll just check if the user exists and return success.
        const userExists = allUsers.some(u => u.email === email);
        if (userExists) {
            console.log(`Password reset link sent to ${email} (simulation)`);
        } else {
            // For security reasons, we don't reveal if an email exists or not.
            console.log(`Password reset requested for non-existent email: ${email} (simulation)`);
        }
        // Always return success to the UI.
        return { success: true };
    };

    // FIX: Implement mock password update function.
    const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
        await sleep(500); // Simulate network latency
        if (!currentUser) {
            // This case should be handled by route protection, but as a safeguard:
            const isResetting = window.location.pathname.includes('reset-password');
            if (!isResetting) {
                 return { success: false, error: "No user is currently logged in." };
            }
        }
        // In a real app, this would be an API call to update the user's password.
        // Since we don't handle real passwords, we'll just log it and return success.
        console.log(`Password for user updated to "${password}" (simulation)`);
        // This won't affect the mock login which uses a hardcoded password.
        return { success: true };
    };

    const value = {
        currentUser,
        allUsers,
        settings,
        loading,
        loadingUsers,
        login,
        logout,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        hasPermission,
        sendPasswordResetEmail,
        updatePassword,
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
