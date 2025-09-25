// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bungalow, Client, Reservation, Invoice, MaintenanceRequest, CommunicationLog, LoyaltyLog, ReservationStatus, BungalowStatus } from '../types';

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
            const [
                { data: bungalowsData }, 
                { data: clientsData },
                { data: reservationsData },
                { data: invoicesData },
                { data: maintenanceData },
            ] = await Promise.all([
                supabase.from('bungalows').select('*'),
                supabase.from('clients').select('*'),
                supabase.from('reservations').select('*'),
                supabase.from('invoices').select('*'),
                supabase.from('maintenance_requests').select('*'),
            ]);

            setBungalows(bungalowsData as Bungalow[] || []);
            setClients(clientsData as Client[] || []);
            setReservations(reservationsData as Reservation[] || []);
            setInvoices(invoicesData as Invoice[] || []);
            setMaintenanceRequests(maintenanceData as MaintenanceRequest[] || []);
        };

        fetchAllData();

        // Set up real-time subscriptions
        const channel = supabase.channel('public:all');

        channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bungalows' }, payload => {
                console.log('Bungalow change received!', payload);
                fetchAllData(); // Refetch all for simplicity, can be optimized
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, payload => {
                 console.log('Reservation change received!', payload);
                 fetchAllData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, payload => {
                 console.log('Client change received!', payload);
                 fetchAllData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    
    const isBungalowAvailable = (bungalowId: string, startDate: string, endDate: string, currentReservationId: string | null): boolean => {
        // This check should ideally be a database function for atomicity,
        // but a client-side check is good for immediate user feedback.
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


    // Generic CRUD operations
    const createCrudOperations = <T extends {id: string}>(table: string, setData: React.Dispatch<React.SetStateAction<T[]>>) => ({
        update: (data: Partial<T>) => supabase.from(table).update(data).eq('id', data.id),
        add: (data: Partial<T>) => supabase.from(table).insert(data as any),
        delete: (id: string) => supabase.from(table).delete().eq('id', id),
    });

    const bungalowOps = createCrudOperations('bungalows', setBungalows);
    const clientOps = createCrudOperations('clients', setClients);
    const invoiceOps = createCrudOperations('invoices', setInvoices);
    const maintenanceOps = createCrudOperations('maintenance_requests', setMaintenanceRequests);
    const communicationOps = createCrudOperations('communication_logs', setCommunicationLogs);
    const loyaltyOps = createCrudOperations('loyalty_logs', setLoyaltyLogs);


    // Custom reservation logic with conflict check
    const addReservation = async (res: Partial<Reservation>) => {
        if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!, null)) {
            alert("Erreur : Ce bungalow est déjà réservé pour ces dates.");
            return { success: false };
        }
        await supabase.from('reservations').insert(res as any);
        return { success: true };
    };

    const updateReservation = async (res: Partial<Reservation>) => {
         if (!isBungalowAvailable(res.bungalowId!, res.startDate!, res.endDate!, res.id!)) {
            alert("Erreur : Ce bungalow est déjà réservé pour ces dates.");
            return { success: false };
        }
        await supabase.from('reservations').update(res).eq('id', res.id);
        return { success: true };
    };


    const value: DataContextType = {
        bungalows, updateBungalow: bungalowOps.update, addBungalow: bungalowOps.add, deleteBungalow: bungalowOps.delete,
        clients, updateClient: clientOps.update, addClient: clientOps.add, deleteClient: clientOps.delete,
        reservations, updateReservation, addReservation,
        invoices, updateInvoice: invoiceOps.update, addInvoice: invoiceOps.add, addInvoices: (invs) => supabase.from('invoices').insert(invs as any), deleteInvoice: invoiceOps.delete,
        maintenanceRequests, updateMaintenanceRequest: maintenanceOps.update, addMaintenanceRequest: maintenanceOps.add, deleteMaintenanceRequest: maintenanceOps.delete,
        communicationLogs, addCommunicationLog: communicationOps.add,
        loyaltyLogs, addLoyaltyLog: loyaltyOps.add,
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
