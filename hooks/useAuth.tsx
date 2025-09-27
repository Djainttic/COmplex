// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Permission, UserRole, UserStatus } from '../types';
import { supabase } from '../lib/supabaseClient';
import { MOCK_SETTINGS, MOCK_ROLES } from '../lib/mockData';

// Helper to simulate async operations for user creation/deletion which would typically be edge functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    settings: Settings;
    loading: boolean;
    loadingUsers: boolean;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    addUser: (userData: Partial<User>) => Promise<{ success: boolean; user?: User; tempPassword?: string; error?: string }>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    updateSettings: (newSettings: Settings) => Promise<void>;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert snake_case from DB to camelCase for app
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const newKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
            result[newKey] = toCamelCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
};

// Helper to convert camelCase from app to snake_case for DB
const toSnakeCase = (obj: any): any => {
     if (Array.isArray(obj)) {
        return obj.map(v => toSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            result[newKey] = toSnakeCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const navigate = useNavigate();

    const fetchUserProfile = useCallback(async (userId: string, userEmail: string | undefined) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error.message);
            return null;
        }

        const profileData = toCamelCase(data);
        const roleSettings = MOCK_ROLES.find(r => r.roleName === profileData.role);
        const permissions = roleSettings ? Object.keys(roleSettings.permissions).filter(p => roleSettings.permissions[p as Permission]) as Permission[] : [];

        return {
            ...profileData,
            email: userEmail || profileData.email,
            lastLogin: '', // This info is not easily available client-side
            isOnline: false, // This would require presence tracking
            permissions,
        } as User;
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id, session.user.email);
                setCurrentUser(profile);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [fetchUserProfile]);

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            return { success: false, error: "Email ou mot de passe incorrect." };
        }
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        navigate('/login');
    };

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error.message);
            setAllUsers([]);
        } else {
             const usersWithPermissions = (toCamelCase(data) as any[]).map(profile => {
                const roleSettings = MOCK_ROLES.find(r => r.roleName === profile.role);
                const permissions = roleSettings ? Object.keys(roleSettings.permissions).filter(p => roleSettings.permissions[p as Permission]) as Permission[] : [];
                return { ...profile, permissions } as User;
            });
            setAllUsers(usersWithPermissions);
        }
        setLoadingUsers(false);
    }, []);

    const updateUser = async (userData: Partial<User>) => {
        const { id, permissions, ...updateData } = userData;
        const snakeCaseData = toSnakeCase(updateData);
        
        // Supabase auth details like email cannot be updated from the `profiles` table.
        delete snakeCaseData.email; 

        const { error } = await supabase.from('profiles').update(snakeCaseData).eq('id', id);
        if (error) {
            console.error("Error updating user:", error);
        } else {
            // Re-fetch all users to update the list
            await fetchUsers();
            // If the updated user is the current user, refresh their profile
            if (currentUser?.id === id && currentUser.email) {
                const updatedProfile = await fetchUserProfile(id, currentUser.email);
                setCurrentUser(updatedProfile);
            }
        }
    };
    
    // NOTE: Creating and deleting users requires Supabase Admin privileges and should be
    // handled via secure Edge Functions. For this project, we'll simulate this locally.
    const addUser = async (userData: Partial<User>) => {
        console.warn("addUser is mocked and does not affect the database.");
        await sleep(500);
        const tempPassword = 'password123';
        
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

    const deleteUser = async (userId: string) => {
        console.warn("deleteUser is mocked and does not affect the database.");
        await sleep(500);
        setAllUsers(prev => prev.filter(u => u.id !== userId));
    };


    const updateSettings = async (newSettings: Settings) => {
        setLoading(true);
        await sleep(500); // This is still mocked
        setSettings(newSettings);
        setLoading(false);
    };

    const hasPermission = useCallback((permission: Permission | Permission[]): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === UserRole.SuperAdmin) return true;
        const userPermissions = new Set(currentUser.permissions);

        if (Array.isArray(permission)) {
            return permission.every(p => userPermissions.has(p));
        }
        return userPermissions.has(permission);
    }, [currentUser]);

    const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
            // For security, don't reveal if the user exists. Log the error for devs.
            console.error("Password reset error:", error.message);
        }
        return { success: true };
    };

    const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
         const { error } = await supabase.auth.updateUser({ password });
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
