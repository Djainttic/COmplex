// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Bungalow, Reservation, Client, MaintenanceRequest, Invoice, CommunicationLog, LoyaltyLog
} from '../types';

// Generic helper to convert snake_case from DB to camelCase for app
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

// Generic helper to convert camelCase from app to snake_case for DB
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

type LoadingStates = {
    bungalows: boolean;
    reservations: boolean;
    clients: boolean;
    maintenanceRequests: boolean;
    invoices: boolean;
    communicationLogs: boolean;
    loyaltyLogs: boolean;
    dashboard: boolean;
};

export interface DashboardStats {
    checkInsToday: number;
    checkOutsToday: number;
    occupancyRate: number;
    pendingMaintenance: number;
}

interface DataContextType {
    bungalows: Bungalow[];
    reservations: Reservation[];
    clients: Client[];
    maintenanceRequests: MaintenanceRequest[];
    invoices: Invoice[];
    communicationLogs: CommunicationLog[];
    loyaltyLogs: LoyaltyLog[];
    isLoading: LoadingStates;
    
    dashboardStats: DashboardStats;
    dashboardBungalows: Pick<Bungalow, 'id' | 'status'>[];
    dashboardReservations: Reservation[];
    dashboardMaintenanceRequests: MaintenanceRequest[];

    fetchDashboardData: () => Promise<void>;

    fetchBungalows: () => Promise<void>;
    addBungalow: (bungalow: Partial<Bungalow>) => Promise<boolean>;
    updateBungalow: (bungalow: Bungalow) => Promise<boolean>;
    deleteBungalow: (id: string) => Promise<boolean>;
    
    fetchReservations: () => Promise<void>;
    addReservation: (reservation: Partial<Reservation>) => Promise<boolean>;
    updateReservation: (reservation: Reservation) => Promise<boolean>;
    
    fetchClients: () => Promise<void>;
    addClient: (client: Partial<Client>) => Promise<boolean>;
    updateClient: (client: Client) => Promise<boolean>;
    deleteClient: (id: string) => Promise<boolean>;
    
    fetchInvoices: () => Promise<void>;
    addInvoice: (invoice: Partial<Invoice>) => Promise<boolean>;
    updateInvoice: (invoice: Invoice) => Promise<boolean>;
    
    fetchMaintenanceRequests: () => Promise<void>;
    addMaintenanceRequest: (request: Partial<MaintenanceRequest>) => Promise<boolean>;
    updateMaintenanceRequest: (request: MaintenanceRequest) => Promise<boolean>;
    deleteMaintenanceRequest: (id: string) => Promise<boolean>;
    
    fetchCommunicationLogs: () => Promise<void>;
    addCommunicationLog: (log: Partial<CommunicationLog>) => Promise<boolean>;

    fetchLoyaltyLogs: () => Promise<void>;
    addLoyaltyLog: (log: Partial<LoyaltyLog>) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bungalows, setBungalows] = useState<Bungalow[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
    const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyLog[]>([]);
    
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({ checkInsToday: 0, checkOutsToday: 0, occupancyRate: 0, pendingMaintenance: 0 });
    const [dashboardBungalows, setDashboardBungalows] = useState<Pick<Bungalow, 'id' | 'status'>[]>([]);
    const [dashboardReservations, setDashboardReservations] = useState<Reservation[]>([]);
    const [dashboardMaintenanceRequests, setDashboardMaintenanceRequests] = useState<MaintenanceRequest[]>([]);

    const [isLoading, setIsLoading] = useState<LoadingStates>({
        bungalows: true, reservations: true, clients: true, maintenanceRequests: true,
        invoices: true, communicationLogs: true, loyaltyLogs: true, dashboard: true,
    });
    
    const setLoading = (key: keyof LoadingStates, value: boolean) => setIsLoading(prev => ({...prev, [key]: value}));
    const handleError = (error: any, context: string) => console.error(`Error in ${context}:`, error.message);

    const fetchDashboardData = useCallback(async () => {
        setLoading('dashboard', true);
        const { data, error } = await supabase.rpc('get_dashboard_data');
        if (error) handleError(error, 'fetching dashboard data via RPC');
        else if (data) {
            setDashboardStats(data.stats);
            setDashboardBungalows(data.bungalowStatuses);
            const allReservations = [...data.upcomingReservations, ...data.recentReservations];
            const uniqueReservations = Array.from(new Map(allReservations.map(item => [item.id, item])).values());
            setDashboardReservations(uniqueReservations);
            setDashboardMaintenanceRequests(data.recentMaintenance);
        }
        setLoading('dashboard', false);
    }, []);

    const createFetcher = (tableName: string, setter: React.Dispatch<any>, stateKey: keyof LoadingStates, columns = '*') => 
        useCallback(async () => {
            setLoading(stateKey, true);
            const { data, error } = await supabase.from(tableName).select(columns);
            if (error) {
                handleError(error, `fetching ${tableName}`);
            } else {
                setter(toCamelCase(data));
            }
            setLoading(stateKey, false);
        }, [tableName, setter, stateKey, columns]);

    const fetchBungalows = createFetcher('bungalows', setBungalows, 'bungalows');
    const fetchReservations = createFetcher('reservations', setReservations, 'reservations');
    const fetchClients = createFetcher('clients', setClients, 'clients');
    const fetchMaintenanceRequests = createFetcher('maintenance_requests', setMaintenanceRequests, 'maintenanceRequests');
    const fetchInvoices = createFetcher('invoices', setInvoices, 'invoices');
    const fetchCommunicationLogs = createFetcher('communication_logs', setCommunicationLogs, 'communicationLogs');
    const fetchLoyaltyLogs = createFetcher('loyalty_logs', setLoyaltyLogs, 'loyaltyLogs');
    
    const createGenericAdder = <T extends { id?: string }>(tableName: string, fetcher: () => Promise<void>) => 
        useCallback(async (item: Partial<T>): Promise<boolean> => {
            const { id, ...data } = item;
            const { error } = await supabase.from(tableName).insert([toSnakeCase(data)]);
            if (error) { handleError(error, `adding ${tableName}`); return false; }
            await fetcher();
            return true;
        }, [tableName, fetcher]);

    const createGenericUpdater = <T extends { id: string }>(tableName: string, fetcher: () => Promise<void>) => 
        useCallback(async (item: T): Promise<boolean> => {
            const { id, ...data } = item;
            const { error } = await supabase.from(tableName).update(toSnakeCase(data)).eq('id', id);
            if (error) { handleError(error, `updating ${tableName}`); return false; }
            await fetcher();
            return true;
        }, [tableName, fetcher]);

    const createGenericDeleter = (tableName: string, fetcher: () => Promise<void>) => 
        useCallback(async (id: string): Promise<boolean> => {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) { handleError(error, `deleting ${tableName}`); return false; }
            await fetcher();
            return true;
        }, [tableName, fetcher]);

    const addBungalow = createGenericAdder<Bungalow>('bungalows', fetchBungalows);
    const updateBungalow = createGenericUpdater<Bungalow>('bungalows', fetchBungalows);
    const deleteBungalow = createGenericDeleter('bungalows', fetchBungalows);
    
    const addReservation = createGenericAdder<Reservation>('reservations', fetchReservations);
    const updateReservation = createGenericUpdater<Reservation>('reservations', fetchReservations);
    
    const addClient = createGenericAdder<Client>('clients', fetchClients);
    const updateClient = createGenericUpdater<Client>('clients', fetchClients);
    const deleteClient = createGenericDeleter('clients', fetchClients);
    
    const addInvoice = createGenericAdder<Invoice>('invoices', fetchInvoices);
    const updateInvoice = createGenericUpdater<Invoice>('invoices', fetchInvoices);
    
    const addMaintenanceRequest = createGenericAdder<MaintenanceRequest>('maintenance_requests', fetchMaintenanceRequests);
    const updateMaintenanceRequest = createGenericUpdater<MaintenanceRequest>('maintenance_requests', fetchMaintenanceRequests);
    const deleteMaintenanceRequest = createGenericDeleter('maintenance_requests', fetchMaintenanceRequests);
    
    const addCommunicationLog = createGenericAdder<CommunicationLog>('communication_logs', fetchCommunicationLogs);
    const addLoyaltyLog = createGenericAdder<LoyaltyLog>('loyalty_logs', fetchLoyaltyLogs);

    const value = {
        bungalows, reservations, clients, maintenanceRequests, invoices, communicationLogs, loyaltyLogs, isLoading,
        dashboardStats, dashboardBungalows, dashboardReservations, dashboardMaintenanceRequests,
        fetchDashboardData,
        fetchBungalows, addBungalow, updateBungalow, deleteBungalow,
        fetchReservations, addReservation, updateReservation,
        fetchClients, addClient, updateClient, deleteClient,
        fetchInvoices, addInvoice, updateInvoice,
        fetchMaintenanceRequests, addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest,
        fetchCommunicationLogs, addCommunicationLog,
        fetchLoyaltyLogs, addLoyaltyLog
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};