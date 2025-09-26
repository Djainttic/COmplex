// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bungalow, BungalowStatus, Client, Reservation, Invoice, MaintenanceRequest, CommunicationLog, LoyaltyLog, ReservationStatus } from '../types';

type MutationResult<T> = { success: boolean; error: any | null; data?: T | T[] | null };

interface DataContextType {
    bungalows: Bungalow[];
    clients: Client[];
    reservations: Reservation[];
    invoices: Invoice[];
    maintenanceRequests: MaintenanceRequest[];
    communicationLogs: CommunicationLog[];
    loyaltyLogs: LoyaltyLog[];
    isLoading: { [key: string]: boolean };

    fetchBungalows: () => Promise<void>;
    fetchClients: () => Promise<void>;
    fetchReservations: () => Promise<void>;
    fetchInvoices: () => Promise<void>;
    fetchMaintenanceRequests: () => Promise<void>;
    fetchCommunicationLogs: () => Promise<void>;
    fetchLoyaltyLogs: () => Promise<void>;

    updateBungalow: (bungalow: Partial<Bungalow>) => Promise<MutationResult<Bungalow>>;
    updateBungalowStatus: (bungalowId: string, status: BungalowStatus) => Promise<MutationResult<Bungalow>>;
    addBungalow: (bungalow: Partial<Bungalow>) => Promise<MutationResult<Bungalow>>;
    deleteBungalow: (bungalowId: string) => Promise<MutationResult<null>>;
    
    updateClient: (client: Partial<Client>) => Promise<MutationResult<Client>>;
    addClient: (client: Partial<Client>) => Promise<MutationResult<Client>>;
    deleteClient: (clientId: string) => Promise<MutationResult<null>>;

    updateReservation: (res: Partial<Reservation>) => Promise<MutationResult<Reservation>>;
    addReservation: (res: Partial<Reservation>) => Promise<MutationResult<Reservation>>;

    updateInvoice: (inv: Partial<Invoice>) => Promise<MutationResult<Invoice>>;
    addInvoice: (inv: Partial<Invoice>) => Promise<MutationResult<Invoice>>;
    addInvoices: (invs: Partial<Invoice>[]) => Promise<MutationResult<Invoice[]>>;
    deleteInvoice: (invoiceId: string) => Promise<MutationResult<null>>;
    
    updateMaintenanceRequest: (req: Partial<MaintenanceRequest>) => Promise<MutationResult<MaintenanceRequest>>;
    addMaintenanceRequest: (req: Partial<MaintenanceRequest>) => Promise<MutationResult<MaintenanceRequest>>;
    deleteMaintenanceRequest: (reqId: string) => Promise<MutationResult<null>>;

    addCommunicationLog: (log: Partial<CommunicationLog>) => Promise<MutationResult<CommunicationLog>>;
    
    addLoyaltyLog: (log: Partial<LoyaltyLog>) => Promise<MutationResult<LoyaltyLog>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const mapDbToBungalow = (dbBungalow: any): Bungalow => ({ id: dbBungalow.id, name: dbBungalow.name, type: dbBungalow.type, status: dbBungalow.status, capacity: dbBungalow.capacity, pricePerNight: dbBungalow.price_per_night, amenities: dbBungalow.amenities, imageUrl: dbBungalow.image_url, description: dbBungalow.description });
const mapBungalowToDb = (bungalow: Partial<Bungalow>): any => ({ id: bungalow.id, name: bungalow.name, type: bungalow.type, status: bungalow.status, capacity: bungalow.capacity, price_per_night: bungalow.pricePerNight, amenities: bungalow.amenities, image_url: bungalow.imageUrl, description: bungalow.description });
const mapDbToClient = (dbClient: any): Client => ({ id: dbClient.id, name: dbClient.name, email: dbClient.email, phone: dbClient.phone, address: dbClient.address, registrationDate: dbClient.registration_date, loyaltyPoints: dbClient.loyalty_points });
const mapClientToDb = (client: Partial<Client>): any => ({ id: client.id, name: client.name, email: client.email, phone: client.phone, address: client.address, registration_date: client.registrationDate, loyalty_points: client.loyaltyPoints });

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const [bungalows, setBungalows] = useState<Bungalow[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
    const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyLog[]>([]);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    
    const fetchData = useCallback(async <T,>(
        dataType: string, 
        setter: React.Dispatch<React.SetStateAction<T[]>>, 
        query: () => Promise<{ data: any[] | null, error: any }>,
        state: T[],
        mapper?: (item: any) => T
    ) => {
        if (state.length > 0 || isLoading[dataType]) return;

        setIsLoading(prev => ({ ...prev, [dataType]: true }));
        try {
            const { data, error } = await query();
            if (error) throw error;
            const mappedData = mapper ? (data as any[]).map(mapper) : (data as T[]);
            setter(mappedData || []);
        } catch (error) {
            console.error(`Failed to load ${dataType}:`, error);
        } finally {
            setIsLoading(prev => ({ ...prev, [dataType]: false }));
        }
    }, [isLoading]);

    const fetchBungalows = useCallback(() => fetchData('bungalows', setBungalows, () => supabase.from('bungalows').select('id, name, type, status, capacity, price_per_night, amenities, image_url, description'), bungalows, mapDbToBungalow), [fetchData, bungalows]);
    const fetchClients = useCallback(() => fetchData('clients', setClients, () => supabase.from('clients').select('id, name, email, phone, address, registration_date, loyalty_points'), clients, mapDbToClient), [fetchData, clients]);
    const fetchReservations = useCallback(() => fetchData('reservations', setReservations, () => supabase.from('reservations').select('id, bungalowId, clientId, startDate, endDate, status, totalPrice'), reservations), [fetchData, reservations]);
    const fetchInvoices = useCallback(() => fetchData('invoices', setInvoices, () => supabase.from('invoices').select('id, reservationId, clientId, issueDate, dueDate, totalAmount, status, items'), invoices), [fetchData, invoices]);
    const fetchMaintenanceRequests = useCallback(() => fetchData('maintenanceRequests', setMaintenanceRequests, () => supabase.from('maintenance_requests').select('id, bungalowId, description, status, priority, createdDate, reportedBy, assignedToId, resolvedDate, resolutionDetails'), maintenanceRequests), [fetchData, maintenanceRequests]);
    const fetchCommunicationLogs = useCallback(() => fetchData('communicationLogs', setCommunicationLogs, () => supabase.from('communication_logs').select('id, recipients, subject, body, sentDate, status, sentBy'), communicationLogs), [fetchData, communicationLogs]);
    const fetchLoyaltyLogs = useCallback(() => fetchData('loyaltyLogs', setLoyaltyLogs, () => supabase.from('loyalty_logs').select('id, clientId, type, pointsChange, reason, timestamp, relatedId, adminUserId'), loyaltyLogs), [fetchData, loyaltyLogs]);

    useEffect(() => {
        const handleInserts = <T extends {id: string}>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>, mapper?: (item: any) => T) => setter(prev => [...prev, mapper ? mapper(payload.new) : payload.new]);
        const handleUpdates = <T extends {id: string}>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>, mapper?: (item: any) => T) => {
            const updatedItem = mapper ? mapper(payload.new) : (payload.new as T);
            setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        };
        const handleDeletes = <T extends {id: string}>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => setter(prev => prev.filter(item => item.id !== (payload.old as any).id));
        
        const createSubscription = <T extends {id: string}>(table: string, setter: React.Dispatch<React.SetStateAction<T[]>>, mapper?: (dbItem: any) => T) => {
            return supabase.channel(`${table}-changes`)
              .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => handleInserts(payload, setter, mapper))
              .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => handleUpdates(payload, setter, mapper))
              .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload) => handleDeletes(payload, setter))
              .subscribe();
        };

        const channels = [
            createSubscription('bungalows', setBungalows, mapDbToBungalow),
            createSubscription('clients', setClients, mapDbToClient),
            createSubscription('reservations', setReservations),
            createSubscription('invoices', setInvoices),
            createSubscription('maintenance_requests', setMaintenanceRequests),
            createSubscription('communication_logs', setCommunicationLogs),
            createSubscription('loyalty_logs', setLoyaltyLogs)
        ];
        return () => { channels.forEach(channel => supabase.removeChannel(channel)); };
    }, []);
    
    const isBungalowAvailable = (bungalowId: string, startDate: string, endDate: string, currentReservationId?: string | null): boolean => {
        const newStart = new Date(startDate).getTime(), newEnd = new Date(endDate).getTime();
        return !reservations.some(res => 
            res.bungalowId === bungalowId && res.id !== currentReservationId && res.status !== ReservationStatus.Cancelled &&
            newStart < new Date(res.endDate).getTime() && newEnd > new Date(res.startDate).getTime()
        );
    };

    const createCrudOperations = <T extends {id: string}>(table: string) => ({
        add: async (data: Partial<T>): Promise<MutationResult<T>> => {
            const { id, ...insertData } = data;
            const { data: newItems, error } = await supabase.from(table).insert(insertData as any).select();
            if (error) return { success: false, error };
            return { success: true, error: null, data: newItems?.[0] as T };
        },
        update: async (data: Partial<T>): Promise<MutationResult<T>> => {
            const { data: updatedItems, error } = await supabase.from(table).update(data as any).eq('id', data.id).select();
            if (error) return { success: false, error };
            return { success: true, error: null, data: updatedItems?.[0] as T };
        },
        delete: async (id: string): Promise<MutationResult<null>> => {
            const { error } = await supabase.from(table).delete().eq('id', id);
            return { success: !error, error };
        },
    });

    const addBungalow = async (bungalow: Partial<Bungalow>): Promise<MutationResult<Bungalow>> => {
        const { id, ...dataToInsert } = bungalow;
        const dbReadyData = mapBungalowToDb(dataToInsert);
        const { data: newItems, error } = await supabase.from('bungalows').insert(dbReadyData).select();
        return { success: !error, error, data: newItems?.[0] ? mapDbToBungalow(newItems[0]) : null };
    };

    const updateBungalow = async (bungalow: Partial<Bungalow>): Promise<MutationResult<Bungalow>> => {
        const { data: updatedItems, error } = await supabase.from('bungalows').update(mapBungalowToDb(bungalow)).eq('id', bungalow.id).select();
        return { success: !error, error, data: updatedItems?.[0] ? mapDbToBungalow(updatedItems[0]) : null };
    };
    
    const deleteBungalow = createCrudOperations<Bungalow>('bungalows').delete;

    const updateBungalowStatus = async (bungalowId: string, status: BungalowStatus): Promise<MutationResult<Bungalow>> => {
        const { data: updatedItems, error } = await supabase.from('bungalows').update({ status }).eq('id', bungalowId).select();
        return { success: !error, error, data: updatedItems?.[0] ? mapDbToBungalow(updatedItems[0]) : null };
    };

    const addClient = async (client: Partial<Client>): Promise<MutationResult<Client>> => {
        const { id, ...dataToInsert } = client;
        const { data: newItems, error } = await supabase.from('clients').insert(mapClientToDb(dataToInsert)).select();
        return { success: !error, error, data: newItems?.[0] ? mapDbToClient(newItems[0]) : null };
    };

    const updateClient = async (client: Partial<Client>): Promise<MutationResult<Client>> => {
        const { data: updatedItems, error } = await supabase.from('clients').update(mapClientToDb(client)).eq('id', client.id).select();
        return { success: !error, error, data: updatedItems?.[0] ? mapDbToClient(updatedItems[0]) : null };
    };

    const deleteClient = createCrudOperations<Client>('clients').delete;
    const invoiceOps = createCrudOperations<Invoice>('invoices');
    const maintenanceOps = createCrudOperations<MaintenanceRequest>('maintenance_requests');
    const communicationOps = createCrudOperations<CommunicationLog>('communication_logs');
    const loyaltyOps = createCrudOperations<LoyaltyLog>('loyalty_logs');
    const reservationOps = createCrudOperations<Reservation>('reservations');

    const addReservation = async (res: Partial<Reservation>): Promise<MutationResult<Reservation>> => {
        if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!)) {
            const error = { message: "Erreur : Ce bungalow est déjà réservé pour ces dates."};
            alert(error.message);
            return { success: false, error };
        }
        return await reservationOps.add(res);
    };

    const updateReservation = async (res: Partial<Reservation>): Promise<MutationResult<Reservation>> => {
         if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!, res.id)) {
            const error = { message: "Erreur : Ce bungalow est déjà réservé pour ces dates."};
            alert(error.message);
            return { success: false, error };
        }
        return await reservationOps.update(res);
    };
    
    const addInvoices = async (invs: Partial<Invoice>[]): Promise<MutationResult<Invoice[]>> => {
        const invoicesToInsert = invs.map(i => { const { id, ...rest } = i; return rest; });
        const { data: newInvoices, error } = await supabase.from('invoices').insert(invoicesToInsert as any).select();
        return { success: !error, error, data: newInvoices };
    };
    
    const value = {
        bungalows, clients, reservations, invoices, maintenanceRequests, communicationLogs, loyaltyLogs, isLoading,
        fetchBungalows, fetchClients, fetchReservations, fetchInvoices, fetchMaintenanceRequests, fetchCommunicationLogs, fetchLoyaltyLogs,
        addBungalow, updateBungalow, updateBungalowStatus, deleteBungalow,
        addClient, updateClient, deleteClient,
        updateReservation, addReservation,
        addInvoice: invoiceOps.add, updateInvoice: invoiceOps.update, deleteInvoice: invoiceOps.delete, addInvoices,
        addMaintenanceRequest: maintenanceOps.add, updateMaintenanceRequest: maintenanceOps.update, deleteMaintenanceRequest: maintenanceOps.delete,
        addCommunicationLog: communicationOps.add,
        addLoyaltyLog: loyaltyOps.add,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataContext');
    return context;
};