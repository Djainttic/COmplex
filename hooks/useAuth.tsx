import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Settings, UserRole, Permission, RoleSetting, Currency, BungalowType, PricingAdjustmentType, UserStatus } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';


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
    moduleStatus: { 
        'bungalows': true, 'reservations': true, 'clients': true, 'facturation': true, 'fidelite': true, 'communication': true, 'maintenance': true, 'rapports': true, 'utilisateurs': true, 'ai': true,
    },
    loyalty: { enabled: true, pointsPerNight: 10, pointsForFirstReservation: 50, pointsToCurrencyValue: 5 },
    license: { key: 'SYPHAX-PRO-2024-DEMO-XXXX', status: 'Active', expiresOn: '2025-12-31T23:59:59Z' },
};


interface AuthContextType {
    currentUser: User | null;
    allUsers: User[];
    login: (email: string, pass: string) => Promise<{ success: boolean; error: string | null }>;
    logout: () => void;
    updateUser: (user: User) => Promise<void>;
    addUser: (userData: Partial<User>, temporaryPassword: string) => Promise<User | null>;
    deleteUser: (userId: string) => Promise<void>;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    settings: Settings;
    updateSettings: (newSettings: Settings) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async (session: Session | null) => {
            try {
                // Fetch settings first
                const { data: settingsData, error: settingsError } = await supabase
                    .from('settings')
                    .select('data')
                    .eq('id', 1)
                    .single();

                if (settingsError) {
                    console.error("Error fetching settings, using defaults:", settingsError);
                } else if (settingsData) {
                    setSettings(settingsData.data);
                }


                if (session) {
                    // Fetch current user's profile
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        console.error("Error fetching profile:", profileError);
                        setCurrentUser(null);
                    } else if (profile) {
                        setCurrentUser({
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
                    }

                    // Fetch all users for management purposes
                    const { data: allProfiles, error: allProfilesError } = await supabase
                        .from('profiles')
                        .select('*');
                    
                    if (allProfilesError) {
                         console.error("Error fetching all profiles (check RLS policies):", allProfilesError);
                    }
                    
                    if(allProfiles) {
                        setAllUsers(allProfiles.map(p => ({
                            id: p.id,
                            name: p.name,
                            email: p.email,
                            phone: p.phone,
                            role: p.role,
                            status: p.status,
                            avatarUrl: p.avatar_url,
                            isOnline: p.is_online,
                            lastLogin: p.last_login,
                            permissions: [],
                        })));
                    }

                } else {
                    setCurrentUser(null);
                    setAllUsers([]);
                }
            } catch (error) {
                console.error("Critical error during initial data fetch:", error);
                setCurrentUser(null);
                setAllUsers([]);
            } finally {
                setLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchInitialData(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(true); // Set loading to true while new session data is fetched
            fetchInitialData(session);
        });

        return () => subscription.unsubscribe();
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
    };

    const updateUser = async (user: User) => {
        const profileData = {
            name: user.name,
            phone: user.phone,
            role: user.role,
            status: user.status,
            avatar_url: user.avatarUrl,
        };

        const { error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);
        
        if (error) {
            console.error("Error updating user profile:", error);
            alert("Erreur lors de la mise à jour du profil.");
            return;
        }
        
        // Update state optimistically
        setAllUsers(prev => prev.map(u => u.id === user.id ? user : u));
        if (currentUser?.id === user.id) {
            setCurrentUser(user);
        }
    };
    
    const addUser = async (userData: Partial<User>, temporaryPassword: string): Promise<User | null> => {
        if (!userData.email || !userData.name) {
            console.error("Email and name are required to create a user.");
            return null;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: temporaryPassword,
        });

        if (authError || !authData.user) {
            console.error("Error creating auth user:", authError);
            alert(`Erreur lors de la création de l'utilisateur : ${authError?.message}`);
            return null;
        }

        const profileData = {
            id: authData.user.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || UserRole.Employee,
            status: userData.status || UserStatus.Active,
            avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
        };

        const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
        
        if (profileError) {
            console.error("Error creating user profile:", profileError);
            alert(`Erreur lors de la création du profil utilisateur.`);
            return null;
        }
        
        const newUser: User = {
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            phone: newProfile.phone,
            role: newProfile.role,
            status: newProfile.status,
            avatarUrl: newProfile.avatar_url,
            isOnline: false,
            lastLogin: newProfile.last_login,
            permissions: [],
        };

        setAllUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const deleteUser = async (userId: string) => {
        console.warn(`Deleting profile for user ${userId}. Auth user may remain if not handled by a server-side function.`);
        
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            console.error("Error deleting user profile:", error);
            alert("Erreur lors de la suppression du profil.");
            return;
        }
        
        setAllUsers(prev => prev.filter(u => u.id !== userId));
    };

    const updateSettings = async (newSettings: Settings) => {
        setSettings(newSettings); 
        
        const { error } = await supabase
            .from('settings')
            .update({ data: newSettings })
            .eq('id', 1);

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

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
