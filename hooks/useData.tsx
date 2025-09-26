// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { 
    Bungalow, Reservation, Client, MaintenanceRequest, Invoice,
    LoyaltyLog, CommunicationLog, AuditLog, BungalowStatus
} from '../types';
import { MOCK_BUNGALOWS, MOCK_RESERVATIONS, MOCK_CLIENTS, MOCK_MAINTENANCE_REQUESTS, MOCK_INVOICES, MOCK_COMMUNICATION_LOGS, MOCK_LOYALTY_LOGS } from '../lib/mockData';

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type ApiResult<T> = { success: boolean; data?: T; error?: { message: string } };

interface DataContextType {
    bungalows: Bungalow[];
    reservations: Reservation[];
    clients: Client[];
    maintenanceRequests: MaintenanceRequest[];
    invoices: Invoice[];
    communicationLogs: CommunicationLog[];
    loyaltyLogs: LoyaltyLog[];
    auditLogs: AuditLog[];
    isLoading: { [key: string]: boolean };

    // Bungalows
    fetchBungalows: () => Promise<void>;
    addBungalow: (bungalow: Omit<Bungalow, 'id'>) => Promise<ApiResult<Bungalow>>;
    updateBungalow: (bungalow: Bungalow) => Promise<ApiResult<Bungalow>>;
    deleteBungalow: (bungalowId: string) => Promise<ApiResult<null>>;
    updateBungalowStatus: (bungalowId: string, status: BungalowStatus) => Promise<ApiResult<Bungalow>>;

    // Reservations
    fetchReservations: () => Promise<void>;
    addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<ApiResult<Reservation>>;
    updateReservation: (reservation: Reservation) => Promise<ApiResult<Reservation>>;

    // Clients
    fetchClients: () => Promise<void>;
    addClient: (client: Omit<Client, 'id'>) => Promise<ApiResult<Client>>;
    updateClient: (client: Client) => Promise<ApiResult<Client>>;
    deleteClient: (clientId: string) => Promise<ApiResult<null>>;
    
    // Maintenance
    fetchMaintenanceRequests: () => Promise<void>;
    addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id'>) => Promise<ApiResult<MaintenanceRequest>>;
    updateMaintenanceRequest: (request: MaintenanceRequest) => Promise<ApiResult<MaintenanceRequest>>;
    deleteMaintenanceRequest: (requestId: string) => Promise<ApiResult<null>>;
    
    // Invoices
    fetchInvoices: () => Promise<void>;
    addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<ApiResult<Invoice>>;
    updateInvoice: (invoice: Invoice) => Promise<ApiResult<Invoice>>;
    
    // Communication
    fetchCommunicationLogs: () => Promise<void>;
    addCommunicationLog: (log: Omit<CommunicationLog, 'id'>) => Promise<ApiResult<CommunicationLog>>;
    
    // Loyalty
    fetchLoyaltyLogs: () => Promise<void>;
    addLoyaltyLog: (log: Omit<LoyaltyLog, 'id'>) => Promise<ApiResult<LoyaltyLog>>;
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
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState({
        bungalows: true,
        reservations: true,
        clients: true,
        maintenanceRequests: true,
        invoices: true,
    });

    const setLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));

    // BUNGALOWS
    const fetchBungalows = useCallback(async () => {
        setLoading('bungalows', true);
        await sleep(500);
        setBungalows(MOCK_BUNGALOWS);
        setLoading('bungalows', false);
    }, []);

    const addBungalow = async (bungalow: Omit<Bungalow, 'id'>): Promise<ApiResult<Bungalow>> => {
        const newBungalow = { ...bungalow, id: `bungalow-${Date.now()}` };
        setBungalows(prev => [...prev, newBungalow]);
        return { success: true, data: newBungalow };
    };

    const updateBungalow = async (bungalow: Bungalow): Promise<ApiResult<Bungalow>> => {
        setBungalows(prev => prev.map(b => b.id === bungalow.id ? bungalow : b));
        return { success: true, data: bungalow };
    };

    const deleteBungalow = async (bungalowId: string): Promise<ApiResult<null>> => {
        setBungalows(prev => prev.filter(b => b.id !== bungalowId));
        return { success: true };
    };

    const updateBungalowStatus = async (bungalowId: string, status: BungalowStatus): Promise<ApiResult<Bungalow>> => {
        let updatedBungalow: Bungalow | undefined;
        setBungalows(prev => prev.map(b => {
            if (b.id === bungalowId) {
                updatedBungalow = { ...b, status };
                return updatedBungalow;
            }
            return b;
        }));
        if (updatedBungalow) {
            return { success: true, data: updatedBungalow };
        }
        return { success: false, error: { message: "Bungalow not found" } }
    };


    // RESERVATIONS
    const fetchReservations = useCallback(async () => {
        setLoading('reservations', true);
        await sleep(500);
        setReservations(MOCK_RESERVATIONS);
        setLoading('reservations', false);
    }, []);

    const addReservation = async (reservation: Omit<Reservation, 'id'>): Promise<ApiResult<Reservation>> => {
        const newReservation = { ...reservation, id: `res-${Date.now()}` };
        setReservations(prev => [...prev, newReservation]);
        return { success: true, data: newReservation };
    };

    const updateReservation = async (reservation: Reservation): Promise<ApiResult<Reservation>> => {
        setReservations(prev => prev.map(r => r.id === reservation.id ? reservation : r));
        return { success: true, data: reservation };
    };
    
    // CLIENTS
    const fetchClients = useCallback(async () => {
        setLoading('clients', true);
        await sleep(500);
        setClients(MOCK_CLIENTS);
        setLoading('clients', false);
    }, []);

    const addClient = async (client: Omit<Client, 'id'>): Promise<ApiResult<Client>> => {
        const newClient = { ...client, id: `client-${Date.now()}` };
        setClients(prev => [...prev, newClient]);
        return { success: true, data: newClient };
    };

    const updateClient = async (client: Client): Promise<ApiResult<Client>> => {
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
        return { success: true, data: client };
    };
    
    const deleteClient = async (clientId: string): Promise<ApiResult<null>> => {
        setClients(prev => prev.filter(c => c.id !== clientId));
        return { success: true };
    };
    
    // MAINTENANCE
    const fetchMaintenanceRequests = useCallback(async () => {
        setLoading('maintenanceRequests', true);
        await sleep(500);
        setMaintenanceRequests(MOCK_MAINTENANCE_REQUESTS);
        setLoading('maintenanceRequests', false);
    }, []);

    const addMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id'>): Promise<ApiResult<MaintenanceRequest>> => {
        const newRequest = { ...request, id: `maint-${Date.now()}` };
        setMaintenanceRequests(prev => [newRequest, ...prev]);
        return { success: true, data: newRequest };
    };

    const updateMaintenanceRequest = async (request: MaintenanceRequest): Promise<ApiResult<MaintenanceRequest>> => {
        setMaintenanceRequests(prev => prev.map(r => r.id === request.id ? request : r));
        return { success: true, data: request };
    };
    
    const deleteMaintenanceRequest = async (requestId: string): Promise<ApiResult<null>> => {
        setMaintenanceRequests(prev => prev.filter(r => r.id !== requestId));
        return { success: true };
    };

    // INVOICES
    const fetchInvoices = useCallback(async () => {
        setLoading('invoices', true);
        await sleep(500);
        setInvoices(MOCK_INVOICES);
        setLoading('invoices', false);
    }, []);

    const addInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<ApiResult<Invoice>> => {
        const newInvoice = { ...invoice, id: `INV-${Date.now()}` };
        setInvoices(prev => [newInvoice, ...prev]);
        return { success: true, data: newInvoice };
    };
    
     const updateInvoice = async (invoice: Invoice): Promise<ApiResult<Invoice>> => {
        setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
        return { success: true, data: invoice };
    };
    
    // COMMUNICATION
    const fetchCommunicationLogs = useCallback(async () => {
        await sleep(500);
        setCommunicationLogs(MOCK_COMMUNICATION_LOGS);
    }, []);

    const addCommunicationLog = async (log: Omit<CommunicationLog, 'id'>): Promise<ApiResult<CommunicationLog>> => {
        const newLog = { ...log, id: `comm-${Date.now()}` };
        setCommunicationLogs(prev => [newLog, ...prev]);
        return { success: true, data: newLog };
    };

    // LOYALTY
    const fetchLoyaltyLogs = useCallback(async () => {
        await sleep(500);
        setLoyaltyLogs(MOCK_LOYALTY_LOGS);
    }, []);
    
    const addLoyaltyLog = async (log: Omit<LoyaltyLog, 'id'>): Promise<ApiResult<LoyaltyLog>> => {
        const newLog = { ...log, id: `loylog-${Date.now()}` };
        setLoyaltyLogs(prev => [newLog, ...prev]);
        return { success: true, data: newLog };
    };

    const value = {
        bungalows, reservations, clients, maintenanceRequests, invoices, communicationLogs, loyaltyLogs, auditLogs, isLoading,
        fetchBungalows, addBungalow, updateBungalow, deleteBungalow, updateBungalowStatus,
        fetchReservations, addReservation, updateReservation,
        fetchClients, addClient, updateClient, deleteClient,
        fetchMaintenanceRequests, addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest,
        fetchInvoices, addInvoice, updateInvoice,
        fetchCommunicationLogs, addCommunicationLog,
        fetchLoyaltyLogs, addLoyaltyLog,
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