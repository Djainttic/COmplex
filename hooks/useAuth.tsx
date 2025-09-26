import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Settings, UserRole, Permission, RoleSetting, Currency, BungalowType, PricingAdjustmentType, UserStatus } from '../types';
import type { Session } from 'https://aistudiocdn.com/@supabase/supabase-js@^2.44.4';


const DEFAULT_SETTINGS: Settings = {
    general: {
        complexName: 'SYPHAX, village touristique',
        logoUrl: 'https://i.ibb.co/2d9y22T/syphax-logo.png',
        bungalowCount: 6,
        loginImageUrl: 'https://i.ibb.co/3W81zgx/syphax-bg.jpg',
        galleryImageUrls: [
            'https://i.ibb.co/3W81zgx/syphax-bg.jpg',
            'https://i.ibb.co/0t0d1Sj/bungalow-1.jpg',
            'https://i.ibb.co/K5y4D1z/bungalow-2.jpg',
            'https://i.ibb.co/yBNgC0P/bungalow-3.jpg',
        ],
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
        { roleName: UserRole.Manager, permissions: { 'bungalows:read': true, 'bungalows:update': true, 'bungalows:update_status': true, 'reservations:read': true, 'reservations:write': true, 'clients:read': true, 'clients:write': true, 'billing:read': true, 'maintenance:read': true, 'maintenance:write': true, 'reports:read': true } },
        { roleName: UserRole.Employee, permissions: { 'bungalows:read': true, 'bungalows:update_status': true, 'reservations:read': true, 'maintenance:read': true } },
    ],
    moduleStatus: { 
        'bungalows': true, 'reservations': true, 'clients': true, 'facturation': true, 'fidelite': true, 'communication': true, 'maintenance': true, 'rapports': true, 'utilisateurs': true, 'ai': true,
    },
    loyalty: { enabled: true, pointsPerNight: 10, pointsForFirstReservation: 50, pointsToCurrencyValue: 5 },
    license: { key: 'SYPHAX-PRO-2024-DEMO-XXXX', status: 'Active', expiresOn: '2025-12-31T23:59:59Z' },
};

type MutationResult<T> = { success: boolean; error: any | null; data?: T | null };

interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    loadingUsers: boolean;
    fetchUsers: () => Promise<void>;
    login: (email: string, pass: string) => Promise<{ success: boolean; error: string | null }>;
    logout: () => void;
    updateUser: (user: User) => Promise<MutationResult<User>>;
    addUser: (userData: Partial<User>, password: string) => Promise<MutationResult<User>>;
    deleteUser: (userId: string) => Promise<MutationResult<null>>;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    settings: Settings;
    updateSettings: (newSettings: Settings) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error: string | null }>;
    isPasswordRecovery: boolean;
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase profile to our app's User type
const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    status: profile.status,
    avatarUrl: profile.avatar_url,
    isOnline: profile.is_online,
    lastLogin: profile.last_login,
    permissions: [], // Permissions are derived from role and settings
});


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    const fetchUsers = useCallback(async () => {
        if (allUsers.length > 0 || loadingUsers) return;

        setLoadingUsers(true);
        try {
            const { data: allProfiles, error: allProfilesError } = await supabase
                .from('profiles')
                .select('*');
            
            if (allProfilesError) {
                 console.error("Error fetching all profiles (check RLS policies):", allProfilesError);
            }
            
            if(allProfiles) {
                setAllUsers(allProfiles.map(mapProfileToUser));
            }
        } catch (error) {
            console.error("Error fetching users list:", error);
        } finally {
            setLoadingUsers(false);
        }

    }, [allUsers.length, loadingUsers]);

    useEffect(() => {
        const fetchEssentialData = async (session: Session | null) => {
            setLoading(true);
            try {
                // Settings and current user profile are essential and loaded on startup.
                const { data: settingsData, error: settingsError } = await supabase
                    .from('settings')
                    .select('data')
                    .eq('id', 1)
                    .maybeSingle();
                
                if (settingsError) {
                    console.error("Error fetching settings, using defaults:", settingsError.message || settingsError);
                } else if (settingsData && settingsData.data) {
                    setSettings(settingsData.data);
                }

                if (session) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        console.error("Error fetching profile:", profileError);
                        setCurrentUser(null);
                    } else if (profile) {
                        setCurrentUser(mapProfileToUser(profile));
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Critical error during essential data fetch:", error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchEssentialData(session);
        });

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
            }
            setSession(session);
            // On auth change, re-fetch essential data. User list is not cleared.
            fetchEssentialData(session);
        });
        
        // --- REALTIME SUBSCRIPTIONS ---
        const profilesChannel = supabase.channel('profiles-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
                const updatedUser = mapProfileToUser(payload.new);
                switch (payload.eventType) {
                    case 'INSERT':
                        setAllUsers(prev => [...prev, updatedUser]);
                        break;
                    case 'UPDATE':
                        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                        if (currentUser?.id === updatedUser.id) {
                            setCurrentUser(updatedUser);
                        }
                        break;
                    case 'DELETE':
                        setAllUsers(prev => prev.filter(u => u.id !== (payload.old as any).id));
                        break;
                }
            })
            .subscribe();

        const settingsChannel = supabase.channel('settings-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.1' }, payload => {
                if (payload.new && (payload.new as any).data) {
                    setSettings((payload.new as any).data);
                }
            })
            .subscribe();

        return () => {
            authSubscription.unsubscribe();
            supabase.removeChannel(profilesChannel);
            supabase.removeChannel(settingsChannel);
        };
    }, []);

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            return { success: false, error: "Email ou mot de passe invalide." };
        }
        return { success: true, error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setAllUsers([]); // Clear user list on logout
        setIsPasswordRecovery(false);
    };

    const sendPasswordResetEmail = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) {
            console.error("Error sending password reset email:", error);
            return { success: false, error: "Une erreur est survenue. Veuillez vérifier l'adresse e-mail et réessayer." };
        }
        return { success: true, error: null };
    };
    
    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            console.error("Error updating password:", error);
            return { success: false, error: "Erreur lors de la mise à jour du mot de passe." };
        }
        setIsPasswordRecovery(false);
        return { success: true, error: null };
    };

    const updateUser = async (user: User): Promise<MutationResult<User>> => {
        const profileData = {
            name: user.name,
            phone: user.phone,
            role: user.role,
            status: user.status,
            avatar_url: user.avatarUrl,
        };
        const { data: updatedProfiles, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id)
            .select();
        if (error || !updatedProfiles || updatedProfiles.length === 0) {
            return { success: false, error: error || 'Profil non trouvé après la mise à jour.' };
        }
        return { success: true, error: null, data: mapProfileToUser(updatedProfiles[0]) };
    };
    
    const addUser = async (userData: Partial<User>, password: string): Promise<MutationResult<User>> => {
        if (!userData.email || !userData.name) {
            const error = { message: "Email and name are required." };
            return { success: false, error };
        }
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: password,
        });
        if (authError || !authData.user) return { success: false, error: authError };

        const profileData = {
            id: authData.user.id, name: userData.name, email: userData.email, phone: userData.phone,
            role: userData.role || UserRole.Employee, status: userData.status || UserStatus.Active,
            avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
        };
        const { data: newProfiles, error: profileError } = await supabase.from('profiles').insert(profileData).select();
        if (profileError || !newProfiles || newProfiles.length === 0) return { success: false, error: profileError };
        return { success: true, error: null, data: mapProfileToUser(newProfiles[0]) };
    };

    const deleteUser = async (userId: string): Promise<MutationResult<null>> => {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) return { success: false, error };
        return { success: true, error: null };
    };

    const updateSettings = async (newSettings: Settings) => {
        const { error } = await supabase.from('settings').upsert({ id: 1, data: newSettings });
        if (error) {
            console.error("Error updating settings:", error);
            alert("Erreur lors de la sauvegarde des paramètres. Les modifications pourraient ne pas être conservées.");
        }
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
        currentUser, allUsers, loadingUsers, fetchUsers,
        login, logout, updateUser, addUser, deleteUser,
        hasPermission, settings, updateSettings, sendPasswordResetEmail,
        isPasswordRecovery, updatePassword,
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
