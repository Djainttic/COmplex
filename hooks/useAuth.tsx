// hooks/useAuth.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { User, Settings, Permission, UserRole, UserStatus } from '../types';
import { MOCK_USERS, MOCK_SETTINGS } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    settings: Settings;
    isAuthenticated: boolean;
    isPasswordRecovery: boolean;
    loading: boolean;
    loadingUsers: boolean;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    updateSettings: (newSettings: Settings) => void;
    fetchUsers: () => Promise<void>;
    updateUser: (user: Partial<User>) => Promise<{ success: boolean; error?: string }>;
    addUser: (user: Partial<User>, password: string) => Promise<{ success: boolean; error?: string; tempPass?: string }>;
    deleteUser: (userId: string) => Promise<{ success: boolean; error?: string; }>;
    sendPasswordResetEmail: (email: string) => Promise<{ success: boolean, error?: string }>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean, error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
    
    // Simulate checking session on startup
    useEffect(() => {
        const checkSession = async () => {
            // In a real app, you'd check supabase.auth.getSession()
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }

            // Check for password recovery URL fragment
            const hash = window.location.hash;
            if (hash.includes('type=recovery')) {
                setIsPasswordRecovery(true);
            }

            await sleep(500); // simulate loading
            setLoading(false);
        };
        checkSession();
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true);
        await sleep(1000); // Simulate network request

        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // This is mock logic. A real app would use supabase.auth.signInWithPassword
        if (user && pass === 'password') { // Generic password for all mock users
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setLoading(false);
            return { success: true };
        } else {
            setLoading(false);
            return { success: false, error: "Email ou mot de passe incorrect." };
        }
    };

    const logout = () => {
        // In a real app: await supabase.auth.signOut();
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        // A full page reload can help clean up state on logout
        window.location.hash = '/login';
        window.location.reload();
    };
    
    const hasPermission = (permission: Permission | Permission[]): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === UserRole.SuperAdmin) return true;

        const userPermissions = new Set(currentUser.permissions);
        if (Array.isArray(permission)) {
            return permission.every(p => userPermissions.has(p));
        }
        // FIX: 'p' was not defined here. The correct variable is 'permission'.
        return userPermissions.has(permission);
    };

    const updateSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        // In a real app, you would persist this to the database
    };
    
    const fetchUsers = async () => {
        setLoadingUsers(true);
        await sleep(500);
        setAllUsers(MOCK_USERS);
        setLoadingUsers(false);
    };

    const updateUser = async (updatedUser: Partial<User>) => {
        if (!updatedUser.id) return { success: false, error: "User ID is missing." };
        
        let success = false;
        setAllUsers(prev => prev.map(u => {
            if (u.id === updatedUser.id) {
                success = true;
                return { ...u, ...updatedUser };
            }
            return u;
        }));

        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(prev => ({ ...prev!, ...updatedUser }));
        }

        return { success };
    };
    
    const addUser = async (user: Partial<User>, password: string) => {
        await sleep(500);
        const tempPass = Math.random().toString(36).slice(-8);
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || UserRole.Employee,
            status: user.status || UserStatus.PendingActivation,
            avatarUrl: 'https://i.ibb.co/2k06Sj1/avatar-placeholder.png',
            lastLogin: new Date().toISOString(),
            isOnline: false,
            permissions: settings.roles.find(r => r.roleName === user.role)?.permissions 
                ? Object.entries(settings.roles.find(r => r.roleName === user.role)!.permissions)
                    .filter(([, value]) => value)
                    .map(([key]) => key as Permission)
                : [],
        };
        setAllUsers(prev => [...prev, newUser]);
        return { success: true, tempPass };
    };
    
    const deleteUser = async (userId: string) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        return { success: true };
    };

    const sendPasswordResetEmail = async (email: string) => {
        // MOCK: In a real app, this would use supabase.auth.resetPasswordForEmail
        await sleep(1000);
        const userExists = allUsers.some(u => u.email === email);
        if (userExists) {
            console.log(`Password reset email sent to ${email} (simulation).`);
        } else {
             console.log(`No user found with email ${email} (simulation).`);
        }
        // Always return success to prevent user enumeration
        return { success: true };
    };

    const updatePassword = async (newPassword: string) => {
         // MOCK: In a real app, this would use supabase.auth.updateUser
         await sleep(1000);
         console.log(`Password updated to "${newPassword}" for user ${currentUser?.email} (simulation).`);
         return { success: true };
    };

    const value = {
        currentUser,
        allUsers,
        settings,
        isAuthenticated: !!currentUser,
        isPasswordRecovery,
        loading,
        loadingUsers,
        login,
        logout,
        hasPermission,
        updateSettings,
        fetchUsers,
        updateUser,
        addUser,
        deleteUser,
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