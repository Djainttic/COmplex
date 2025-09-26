// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Added UserStatus to the import from ../types to resolve a missing type error.
import { User, Settings, Permission, RoleSetting, UserRole, UserStatus } from '../types';
import { MOCK_USERS, MOCK_SETTINGS, MOCK_ROLES } from '../lib/mockData';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    settings: Settings;
    loading: boolean;
    loadingUsers: boolean;
    session: Session | null;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    fetchUsers: () => Promise<void>;
    addUser: (userData: Partial<User>, password?: string) => Promise<{ success: boolean; user?: User; tempPassword?: string; error?: string }>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    updateSettings: (newSettings: Settings) => Promise<void>;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    sendPasswordResetEmail: (email: string) => Promise<{ success: boolean, error?: string }>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean, error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                // In a real app, you'd fetch the user profile from your database.
                // Here, we find the mock user by email.
                const user = MOCK_USERS.find(u => u.email === session.user.email);
                setCurrentUser(user || null);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);
    
    // Simulate initial data load
    useEffect(() => {
        fetchUsers();
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true);
        // Supabase handles the actual auth
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            setLoading(false);
            return { success: false, error: "Email ou mot de passe incorrect." };
        }
        
        // Find user from our mock data
        const user = MOCK_USERS.find(u => u.email === email);
        if (!user) {
            await logout();
            setLoading(false);
            return { success: false, error: "Utilisateur non trouvé dans le système." };
        }
        
        setCurrentUser(user);
        setLoading(false);
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        navigate('/login');
    };

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        await sleep(500); // Simulate API call
        setAllUsers(MOCK_USERS);
        setLoadingUsers(false);
    }, []);

    const addUser = async (userData: Partial<User>, password?: string) => {
        await sleep(500);
        // In real app, you'd call Supabase to create an auth user, then create a profile in your DB.
        const tempPassword = password || Math.random().toString(36).slice(-8);
        console.log(`Creating user ${userData.email} with password ${tempPassword}`);
        
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
        const userPermissions = new Set(currentUser.permissions);

        if (Array.isArray(permission)) {
            return permission.every(p => userPermissions.has(p));
        }
        return userPermissions.has(permission);
    }, [currentUser]);

    const sendPasswordResetEmail = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
            console.error("Password reset error:", error);
            // Don't reveal if email exists
            return { success: true }; 
        }
        return { success: true };
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            return { success: false, error: "Impossible de mettre à jour le mot de passe." };
        }
        return { success: true };
    };


    const value = {
        currentUser,
        allUsers,
        settings,
        loading,
        loadingUsers,
        session,
        login,
        logout,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        hasPermission,
        sendPasswordResetEmail,
        updatePassword
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
