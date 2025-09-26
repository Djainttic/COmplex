// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bungalow, Client, Reservation, Invoice, MaintenanceRequest, CommunicationLog, LoyaltyLog, ReservationStatus } from '../types';

interface DataContextType {
    bungalows: Bungalow[];
    updateBungalow: (bungalow: Partial<Bungalow>) => Promise<any>;
    addBungalow: (bungalow: Partial<Bungalow>) => Promise<any>;
    deleteBungalow: (bungalowId: string) => Promise<any>;
    
    clients: Client[];
    updateClient: (client: Partial<Client>) => Promise<any>;
    addClient: (client: Partial<Client>) => Promise<any>;
    deleteClient: (clientId: string) => Promise<any>;

    reservations: Reservation[];
    updateReservation: (res: Partial<Reservation>) => Promise<{success: boolean}>;
    addReservation: (res: Partial<Reservation>) => Promise<{success: boolean}>;

    invoices: Invoice[];
    updateInvoice: (inv: Partial<Invoice>) => Promise<any>;
    addInvoice: (inv: Partial<Invoice>) => Promise<any>;
    addInvoices: (invs: Partial<Invoice>[]) => Promise<any>;
    deleteInvoice: (invoiceId: string) => Promise<any>;
    
    maintenanceRequests: MaintenanceRequest[];
    updateMaintenanceRequest: (req: Partial<MaintenanceRequest>) => Promise<any>;
    addMaintenanceRequest: (req: Partial<MaintenanceRequest>) => Promise<any>;
    deleteMaintenanceRequest: (reqId: string) => Promise<any>;

    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: Partial<CommunicationLog>) => Promise<any>;
    
    loyaltyLogs: LoyaltyLog[];
    addLoyaltyLog: (log: Partial<LoyaltyLog>) => Promise<any>;
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
                // Optionally set an error state here to show a banner to the user
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

    // Generic CRUD Operations with manual state update
    const createCrudOperations = <T extends {id: string}>(
        table: string, 
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => ({
        add: async (data: Partial<T>) => {
            const { id, ...insertData } = data; // Destructure to remove client-side id
            const { data: newData, error } = await supabase.from(table).insert(insertData as any).select().single();
            if (!error && newData) {
                setter(prev => [...prev, newData]);
            }
            return { data: newData, error };
        },
        update: async (data: Partial<T>) => {
            const { data: updatedData, error } = await supabase.from(table).update(data as any).eq('id', data.id).select().single();
             if (!error && updatedData) {
                setter(prev => prev.map(item => item.id === updatedData.id ? updatedData : item));
            }
            return { data: updatedData, error };
        },
        delete: async (id: string) => {
            const { error } = await supabase.from(table).delete().eq('id', id);
             if (!error) {
                setter(prev => prev.filter(item => item.id !== id));
            }
            return { error };
        },
    });

    const bungalowOps = createCrudOperations('bungalows', setBungalows);
    const clientOps = createCrudOperations('clients', setClients);
    const invoiceOps = createCrudOperations('invoices', setInvoices);
    const maintenanceOps = createCrudOperations('maintenance_requests', setMaintenanceRequests);
    const communicationOps = createCrudOperations('communication_logs', setCommunicationLogs);
    const loyaltyOps = createCrudOperations('loyalty_logs', setLoyaltyLogs);

    // Custom reservation logic with conflict check
    const addReservation = async (res: Partial<Reservation>) => {
        if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!)) {
            alert("Erreur : Ce bungalow est déjà réservé pour ces dates.");
            return { success: false };
        }
        const { id, ...insertData } = res;
        const { data: newReservation, error } = await supabase.from('reservations').insert(insertData as any).select().single();
        if (!error && newReservation) {
            setReservations(prev => [...prev, newReservation]);
            return { success: true };
        }
        return { success: false };
    };

    const updateReservation = async (res: Partial<Reservation>) => {
         if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!, res.id)) {
            alert("Erreur : Ce bungalow est déjà réservé pour ces dates.");
            return { success: false };
        }
        const { data: updatedReservation, error } = await supabase.from('reservations').update(res as any).eq('id', res.id).select().single();
        if (!error && updatedReservation) {
            setReservations(prev => prev.map(item => item.id === updatedReservation.id ? updatedReservation : item));
            return { success: true };
        }
        return { success: false };
    };
    
    const addInvoices = async (invs: Partial<Invoice>[]) => {
        const invoicesToInsert = invs.map(i => {
            const { id, ...rest } = i;
            return rest;
        });
        const { data: newInvoices, error } = await supabase.from('invoices').insert(invoicesToInsert as any).select();
        if (!error && newInvoices) {
            setInvoices(prev => [...prev, ...newInvoices]);
        }
        return { data: newInvoices, error };
    };

    const value: DataContextType = {
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
