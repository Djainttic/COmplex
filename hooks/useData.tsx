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
};

interface DataContextType {
    bungalows: Bungalow[];
    reservations: Reservation[];
    clients: Client[];
    maintenanceRequests: MaintenanceRequest[];
    invoices: Invoice[];
    communicationLogs: CommunicationLog[];
    loyaltyLogs: LoyaltyLog[];
    isLoading: LoadingStates;
    
    fetchBungalows: () => Promise<void>;
    addBungalow: (bungalow: Partial<Bungalow>) => Promise<void>;
    updateBungalow: (bungalow: Bungalow) => Promise<void>;
    deleteBungalow: (id: string) => Promise<void>;
    
    fetchReservations: () => Promise<void>;
    addReservation: (reservation: Partial<Reservation>) => Promise<void>;
    updateReservation: (reservation: Reservation) => Promise<void>;
    
    fetchClients: () => Promise<void>;
    addClient: (client: Partial<Client>) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    
    fetchInvoices: () => Promise<void>;
    addInvoice: (invoice: Partial<Invoice>) => Promise<void>;
    updateInvoice: (invoice: Invoice) => Promise<void>;
    
    fetchMaintenanceRequests: () => Promise<void>;
    addMaintenanceRequest: (request: Partial<MaintenanceRequest>) => Promise<void>;
    updateMaintenanceRequest: (request: MaintenanceRequest) => Promise<void>;
    deleteMaintenanceRequest: (id: string) => Promise<void>;
    
    fetchCommunicationLogs: () => Promise<void>;
    addCommunicationLog: (log: Partial<CommunicationLog>) => Promise<void>;

    fetchLoyaltyLogs: () => Promise<void>;
    addLoyaltyLog: (log: Partial<LoyaltyLog>) => Promise<void>;
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

    const [isLoading, setIsLoading] = useState<LoadingStates>({
        bungalows: true, reservations: true, clients: true, maintenanceRequests: true,
        invoices: true, communicationLogs: true, loyaltyLogs: true,
    });
    
    const setLoading = (key: keyof LoadingStates, value: boolean) => {
        setIsLoading(prev => ({...prev, [key]: value}));
    };
    
    const handleError = (error: any, context: string) => {
        console.error(`Error in ${context}:`, error.message);
        // Here you could use a toast notification to inform the user
    };

    // Generic fetcher
    const createFetcher = (tableName: string, setter: React.Dispatch<any>, stateKey: keyof LoadingStates) => 
        useCallback(async () => {
            setLoading(stateKey, true);
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) handleError(error, `fetching ${tableName}`);
            else setter(toCamelCase(data));
            setLoading(stateKey, false);
        }, [tableName, setter, stateKey]);

    const fetchBungalows = createFetcher('bungalows', setBungalows, 'bungalows');
    const fetchReservations = createFetcher('reservations', setReservations, 'reservations');
    const fetchClients = createFetcher('clients', setClients, 'clients');
    const fetchMaintenanceRequests = createFetcher('maintenance_requests', setMaintenanceRequests, 'maintenanceRequests');
    const fetchInvoices = createFetcher('invoices', setInvoices, 'invoices');
    const fetchCommunicationLogs = createFetcher('communication_logs', setCommunicationLogs, 'communicationLogs');
    const fetchLoyaltyLogs = createFetcher('loyalty_logs', setLoyaltyLogs, 'loyaltyLogs');
    
    const addBungalow = async (bungalow: Partial<Bungalow>) => {
        const { error } = await supabase.from('bungalows').insert([toSnakeCase(bungalow)]);
        if (error) handleError(error, 'adding bungalow'); else await fetchBungalows();
    };
    const updateBungalow = async (bungalow: Bungalow) => {
        const { id, ...data } = bungalow;
        const { error } = await supabase.from('bungalows').update(toSnakeCase(data)).eq('id', id);
        if (error) handleError(error, 'updating bungalow'); else await fetchBungalows();
    };
    const deleteBungalow = async (id: string) => {
        const { error } = await supabase.from('bungalows').delete().eq('id', id);
        if (error) handleError(error, 'deleting bungalow'); else await fetchBungalows();
    };
    
    const addReservation = async (reservation: Partial<Reservation>) => {
        const { error } = await supabase.from('reservations').insert([toSnakeCase(reservation)]);
        if (error) handleError(error, 'adding reservation'); else await fetchReservations();
    };
    const updateReservation = async (reservation: Reservation) => {
        const { id, ...data } = reservation;
        const { error } = await supabase.from('reservations').update(toSnakeCase(data)).eq('id', id);
        if (error) handleError(error, 'updating reservation'); else await fetchReservations();
    };

    const addClient = async (client: Partial<Client>) => {
        const { error } = await supabase.from('clients').insert([toSnakeCase(client)]);
        if (error) handleError(error, 'adding client'); else await fetchClients();
    };
    const updateClient = async (client: Client) => {
        const { id, ...data } = client;
        const { error } = await supabase.from('clients').update(toSnakeCase(data)).eq('id', id);
        if (error) handleError(error, 'updating client'); else await fetchClients();
    };
    const deleteClient = async (id: string) => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) handleError(error, 'deleting client'); else await fetchClients();
    };

    const addInvoice = async (invoice: Partial<Invoice>) => {
        const { error } = await supabase.from('invoices').insert([toSnakeCase(invoice)]);
        if (error) handleError(error, 'adding invoice'); else await fetchInvoices();
    };
    const updateInvoice = async (invoice: Invoice) => {
        const { id, ...data } = invoice;
        const { error } = await supabase.from('invoices').update(toSnakeCase(data)).eq('id', id);
        if (error) handleError(error, 'updating invoice'); else await fetchInvoices();
    };
    
    const addMaintenanceRequest = async (request: Partial<MaintenanceRequest>) => {
        const { error } = await supabase.from('maintenance_requests').insert([toSnakeCase(request)]);
        if (error) handleError(error, 'adding maintenance request'); else await fetchMaintenanceRequests();
    };
    const updateMaintenanceRequest = async (request: MaintenanceRequest) => {
        const { id, ...data } = request;
        const { error } = await supabase.from('maintenance_requests').update(toSnakeCase(data)).eq('id', id);
        if (error) handleError(error, 'updating maintenance request'); else await fetchMaintenanceRequests();
    };
    const deleteMaintenanceRequest = async (id: string) => {
        const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
        if (error) handleError(error, 'deleting maintenance request'); else await fetchMaintenanceRequests();
    };

    const addCommunicationLog = async (log: Partial<CommunicationLog>) => {
        const { error } = await supabase.from('communication_logs').insert([toSnakeCase(log)]);
        if (error) handleError(error, 'adding communication log'); else await fetchCommunicationLogs();
    };
    
    const addLoyaltyLog = async (log: Partial<LoyaltyLog>) => {
        const { error } = await supabase.from('loyalty_logs').insert([toSnakeCase(log)]);
        if (error) handleError(error, 'adding loyalty log'); else await fetchLoyaltyLogs();
    };


    const value = {
        bungalows, reservations, clients, maintenanceRequests, invoices, communicationLogs, loyaltyLogs, isLoading,
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
