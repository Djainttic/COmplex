// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bungalow, Client, Reservation, Invoice, MaintenanceRequest, CommunicationLog, LoyaltyLog, ReservationStatus } from '../types';

type MutationResult<T> = { success: boolean; error: any | null; data?: T | T[] | null };

interface DataContextType {
    bungalows: Bungalow[];
    updateBungalow: (bungalow: Partial<Bungalow>) => Promise<MutationResult<Bungalow>>;
    addBungalow: (bungalow: Partial<Bungalow>) => Promise<MutationResult<Bungalow>>;
    deleteBungalow: (bungalowId: string) => Promise<MutationResult<null>>;
    
    clients: Client[];
    updateClient: (client: Partial<Client>) => Promise<MutationResult<Client>>;
    addClient: (client: Partial<Client>) => Promise<MutationResult<Client>>;
    deleteClient: (clientId: string) => Promise<MutationResult<null>>;

    reservations: Reservation[];
    updateReservation: (res: Partial<Reservation>) => Promise<MutationResult<Reservation>>;
    addReservation: (res: Partial<Reservation>) => Promise<MutationResult<Reservation>>;

    invoices: Invoice[];
    updateInvoice: (inv: Partial<Invoice>) => Promise<MutationResult<Invoice>>;
    addInvoice: (inv: Partial<Invoice>) => Promise<MutationResult<Invoice>>;
    addInvoices: (invs: Partial<Invoice>[]) => Promise<MutationResult<Invoice[]>>;
    deleteInvoice: (invoiceId: string) => Promise<MutationResult<null>>;
    
    maintenanceRequests: MaintenanceRequest[];
    updateMaintenanceRequest: (req: Partial<MaintenanceRequest>) => Promise<MutationResult<MaintenanceRequest>>;
    addMaintenanceRequest: (req: Partial<MaintenanceRequest>) => Promise<MutationResult<MaintenanceRequest>>;
    deleteMaintenanceRequest: (reqId: string) => Promise<MutationResult<null>>;

    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: Partial<CommunicationLog>) => Promise<MutationResult<CommunicationLog>>;
    
    loyaltyLogs: LoyaltyLog[];
    addLoyaltyLog: (log: Partial<LoyaltyLog>) => Promise<MutationResult<LoyaltyLog>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const [bungalows, setBungalows] = useState<Bungalow[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
    const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyLog[]>([]);
    
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [
                    { data: bungalowsData, error: bungalowsError }, 
                    { data: clientsData, error: clientsError },
                    { data: reservationsData, error: reservationsError },
                    { data: invoicesData, error: invoicesError },
                    { data: maintenanceData, error: maintenanceError },
                    { data: communicationData, error: communicationError },
                    { data: loyaltyData, error: loyaltyError },
                ] = await Promise.all([
                    supabase.from('bungalows').select('*'),
                    supabase.from('clients').select('*'),
                    supabase.from('reservations').select('*'),
                    supabase.from('invoices').select('*'),
                    supabase.from('maintenance_requests').select('*'),
                    supabase.from('communication_logs').select('*'),
                    supabase.from('loyalty_logs').select('*'),
                ]);

                if (bungalowsError) throw bungalowsError;
                if (clientsError) throw clientsError;
                if (reservationsError) throw reservationsError;
                if (invoicesError) throw invoicesError;
                if (maintenanceError) throw maintenanceError;
                if (communicationError) throw communicationError;
                if (loyaltyError) throw loyaltyError;

                setBungalows((bungalowsData as any[]) || []);
                setClients((clientsData as any[]) || []);
                setReservations((reservationsData as any[]) || []);
                setInvoices((invoicesData as any[]) || []);
                setMaintenanceRequests((maintenanceData as any[]) || []);
                setCommunicationLogs((communicationData as any[]) || []);
                setLoyaltyLogs((loyaltyData as any[]) || []);
            } catch (error) {
                console.error("Failed to load initial application data:", error);
            }
        };

        fetchAllData();
    }, []);
    
    const isBungalowAvailable = (bungalowId: string, startDate: string, endDate: string, currentReservationId?: string | null): boolean => {
        const newStart = new Date(startDate).getTime();
        const newEnd = new Date(endDate).getTime();

        const conflictingReservation = reservations.find(res => {
            if (res.bungalowId !== bungalowId || res.id === currentReservationId || res.status === ReservationStatus.Cancelled) {
                return false;
            }
            const existingStart = new Date(res.startDate).getTime();
            const existingEnd = new Date(res.endDate).getTime();
            return newStart < existingEnd && newEnd > existingStart;
        });

        return !conflictingReservation;
    };

    const createCrudOperations = <T extends {id: string}>(
        table: string, 
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => ({
        add: async (data: Partial<T>): Promise<MutationResult<T>> => {
            const { id, ...insertData } = data;
            const { data: newItems, error } = await supabase.from(table).insert(insertData as any).select();
            
            if (error) {
                console.error(`Error adding to ${table}:`, error);
                return { success: false, error };
            }
            if (newItems && newItems.length > 0) {
                const newItem = newItems[0] as T;
                setter(prev => [...prev, newItem]);
                return { success: true, error: null, data: newItem };
            }
            const silentError = { message: 'Insert succeeded but no data was returned. Check RLS policies.' };
            console.error(silentError.message);
            return { success: false, error: silentError };
        },
        update: async (data: Partial<T>): Promise<MutationResult<T>> => {
            const { data: updatedItems, error } = await supabase.from(table).update(data as any).eq('id', data.id).select();

             if (error) {
                console.error(`Error updating ${table}:`, error);
                return { success: false, error };
            }
            if (updatedItems && updatedItems.length > 0) {
                const updatedItem = updatedItems[0] as T;
                setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
                return { success: true, error: null, data: updatedItem };
            }
            const silentError = { message: 'Update succeeded but no data was returned. Check RLS policies.' };
            console.error(silentError.message);
            return { success: false, error: silentError };
        },
        delete: async (id: string): Promise<MutationResult<null>> => {
            const { error } = await supabase.from(table).delete().eq('id', id);
             if (!error) {
                setter(prev => prev.filter(item => item.id !== id));
                return { success: true, error: null };
            }
            console.error(`Error deleting from ${table}:`, error);
            return { success: false, error };
        },
    });

    const bungalowOps = createCrudOperations('bungalows', setBungalows);
    const clientOps = createCrudOperations('clients', setClients);
    const invoiceOps = createCrudOperations('invoices', setInvoices);
    const maintenanceOps = createCrudOperations('maintenance_requests', setMaintenanceRequests);
    const communicationOps = createCrudOperations('communication_logs', setCommunicationLogs);
    const loyaltyOps = createCrudOperations('loyalty_logs', setLoyaltyLogs);

    // Custom reservation logic with conflict check
    const addReservation = async (res: Partial<Reservation>): Promise<MutationResult<Reservation>> => {
        if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!)) {
            const error = { message: "Erreur : Ce bungalow est déjà réservé pour ces dates."};
            alert(error.message);
            return { success: false, error };
        }
        return await createCrudOperations('reservations', setReservations).add(res);
    };

    const updateReservation = async (res: Partial<Reservation>): Promise<MutationResult<Reservation>> => {
         if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!, res.id)) {
            const error = { message: "Erreur : Ce bungalow est déjà réservé pour ces dates."};
            alert(error.message);
            return { success: false, error };
        }
        return await createCrudOperations('reservations', setReservations).update(res);
    };
    
    const addInvoices = async (invs: Partial<Invoice>[]): Promise<MutationResult<Invoice[]>> => {
        const invoicesToInsert = invs.map(i => {
            const { id, ...rest } = i;
            return rest;
        });
        const { data: newInvoices, error } = await supabase.from('invoices').insert(invoicesToInsert as any).select();
        if (!error && newInvoices) {
            setInvoices(prev => [...prev, ...newInvoices]);
            return { success: true, error: null, data: newInvoices };
        }
        return { success: false, error };
    };

    const value: DataContextType = useMemo(() => ({
        bungalows,
        addBungalow: bungalowOps.add,
        updateBungalow: bungalowOps.update,
        deleteBungalow: bungalowOps.delete,
        clients,
        addClient: clientOps.add,
        updateClient: clientOps.update,
        deleteClient: clientOps.delete,
        reservations,
        updateReservation,
        addReservation,
        invoices,
        addInvoice: invoiceOps.add,
        updateInvoice: invoiceOps.update,
        deleteInvoice: invoiceOps.delete,
        addInvoices,
        maintenanceRequests,
        addMaintenanceRequest: maintenanceOps.add,
        updateMaintenanceRequest: maintenanceOps.update,
        deleteMaintenanceRequest: maintenanceOps.delete,
        communicationLogs,
        addCommunicationLog: communicationOps.add,
        loyaltyLogs,
        addLoyaltyLog: loyaltyOps.add,
    }), [bungalows, clients, reservations, invoices, maintenanceRequests, communicationLogs, loyaltyLogs]);


    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};