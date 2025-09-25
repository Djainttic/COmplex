import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Settings, UserRole, Permission, RoleSetting, Currency, BungalowType, PricingAdjustmentType } from '../types';
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
    addUser: (userData: Partial<User>) => Promise<User | null>;
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
        // Implementation for updating user profile in Supabase
    };
    
    const addUser = async (userData: Partial<User>): Promise<User | null> => {
       // IMPORTANT: In a real app, creating an auth user (supabase.auth.signUp)
       // should be done in a secure Supabase Edge Function to avoid exposing service keys.
       // This implementation only creates the profile, assuming the auth user is created separately.
       console.warn("User creation only adds a profile. Auth user creation should be handled server-side.");
       return null;
    };

    const deleteUser = async (userId: string) => {
        // IMPORTANT: Like user creation, deleting an auth user requires admin privileges
        // and should be handled in a Supabase Edge Function.
    };

    const updateSettings = async (newSettings: Settings) => {
        // Implementation for updating settings in Supabase
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