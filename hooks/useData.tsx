// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
    Bungalow, Reservation, Client, MaintenanceRequest, Invoice, CommunicationLog, LoyaltyLog, LoyaltyLogType
} from '../types';
import {
    MOCK_BUNGALOWS, MOCK_RESERVATIONS, MOCK_CLIENTS, MOCK_MAINTENANCE_REQUESTS,
    MOCK_INVOICES, MOCK_COMMUNICATION_LOGS, MOCK_LOYALTY_LOGS
} from '../lib/mockData';
import { useToasts } from './useToasts';
import { useAuth } from './useAuth';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    }

    // Bungalows
    const fetchBungalows = useCallback(async () => { setLoading('bungalows', true); await sleep(300); setBungalows(MOCK_BUNGALOWS); setLoading('bungalows', false); }, []);
    const addBungalow = async (bungalow: Partial<Bungalow>) => { await sleep(200); setBungalows(prev => [...prev, { ...bungalow, id: `bungalow-${Date.now()}` } as Bungalow]); };
    const updateBungalow = async (bungalow: Bungalow) => { await sleep(200); setBungalows(prev => prev.map(b => b.id === bungalow.id ? bungalow : b)); };
    const deleteBungalow = async (id: string) => { await sleep(200); setBungalows(prev => prev.filter(b => b.id !== id)); };

    // Reservations
    const fetchReservations = useCallback(async () => { setLoading('reservations', true); await sleep(400); setReservations(MOCK_RESERVATIONS); setLoading('reservations', false); }, []);
    const addReservation = async (reservation: Partial<Reservation>) => { await sleep(200); setReservations(prev => [...prev, { ...reservation, id: `res-${Date.now()}` } as Reservation]); };
    const updateReservation = async (reservation: Reservation) => { await sleep(200); setReservations(prev => prev.map(r => r.id === reservation.id ? reservation : r)); };

    // Clients
    const fetchClients = useCallback(async () => { setLoading('clients', true); await sleep(350); setClients(MOCK_CLIENTS); setLoading('clients', false); }, []);
    const addClient = async (client: Partial<Client>) => { await sleep(200); setClients(prev => [...prev, { ...client, id: `client-${Date.now()}`, registrationDate: new Date().toISOString() } as Client]); };
    const updateClient = async (client: Client) => { await sleep(200); setClients(prev => prev.map(c => c.id === client.id ? client : c)); };
    const deleteClient = async (id: string) => { await sleep(200); setClients(prev => prev.filter(c => c.id !== id)); };

    // Invoices
    const fetchInvoices = useCallback(async () => { setLoading('invoices', true); await sleep(500); setInvoices(MOCK_INVOICES); setLoading('invoices', false); }, []);
    const addInvoice = async (invoice: Partial<Invoice>) => { await sleep(200); setInvoices(prev => [...prev, { ...invoice, id: `INV-${new Date().getFullYear()}-${String(prev.length + 1).padStart(3, '0')}` } as Invoice]); };
    const updateInvoice = async (invoice: Invoice) => { await sleep(200); setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i)); };

    // Maintenance
    const fetchMaintenanceRequests = useCallback(async () => { setLoading('maintenanceRequests', true); await sleep(450); setMaintenanceRequests(MOCK_MAINTENANCE_REQUESTS); setLoading('maintenanceRequests', false); }, []);
    const addMaintenanceRequest = async (request: Partial<MaintenanceRequest>) => { await sleep(200); setMaintenanceRequests(prev => [...prev, { ...request, id: `maint-${Date.now()}`, createdDate: new Date().toISOString() } as MaintenanceRequest]); };
    const updateMaintenanceRequest = async (request: MaintenanceRequest) => { await sleep(200); setMaintenanceRequests(prev => prev.map(r => r.id === request.id ? request : r)); };
    const deleteMaintenanceRequest = async (id: string) => { await sleep(200); setMaintenanceRequests(prev => prev.filter(r => r.id !== id)); };

    // Communication
    const fetchCommunicationLogs = useCallback(async () => { setLoading('communicationLogs', true); await sleep(200); setCommunicationLogs(MOCK_COMMUNICATION_LOGS); setLoading('communicationLogs', false); }, []);
    const addCommunicationLog = async (log: Partial<CommunicationLog>) => { await sleep(200); setCommunicationLogs(prev => [...prev, { ...log, id: `comm-${Date.now()}` } as CommunicationLog]); };
    
    // Loyalty
    const fetchLoyaltyLogs = useCallback(async () => { setLoading('loyaltyLogs', true); await sleep(250); setLoyaltyLogs(MOCK_LOYALTY_LOGS); setLoading('loyaltyLogs', false); }, []);
    const addLoyaltyLog = async (log: Partial<LoyaltyLog>) => { await sleep(100); setLoyaltyLogs(prev => [...prev, { ...log, id: `loylog-${Date.now()}` } as LoyaltyLog]); };


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
