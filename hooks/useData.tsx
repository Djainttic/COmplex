// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bungalow, BungalowStatus, Client, Reservation, Invoice, MaintenanceRequest, CommunicationLog, LoyaltyLog, ReservationStatus } from '../types';

type MutationResult<T> = { success: boolean; error: any | null; data?: T | T[] | null };

interface DataContextType {
    bungalows: Bungalow[];
    updateBungalow: (bungalow: Partial<Bungalow>) => Promise<MutationResult<Bungalow>>;
    updateBungalowStatus: (bungalowId: string, status: BungalowStatus) => Promise<MutationResult<Bungalow>>;
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

// Helper mappers for Bungalow data type to handle camelCase/snake_case mismatch
const mapDbToBungalow = (dbBungalow: any): Bungalow => ({
    id: dbBungalow.id,
    name: dbBungalow.name,
    type: dbBungalow.type,
    status: dbBungalow.status,
    capacity: dbBungalow.capacity,
    pricePerNight: dbBungalow.price_per_night,
    amenities: dbBungalow.amenities,
    imageUrl: dbBungalow.image_url,
    description: dbBungalow.description,
});

const mapBungalowToDb = (bungalow: Partial<Bungalow>): any => {
    const dbData: any = {};
    if (bungalow.id !== undefined) dbData.id = bungalow.id;
    if (bungalow.name !== undefined) dbData.name = bungalow.name;
    if (bungalow.type !== undefined) dbData.type = bungalow.type;
    if (bungalow.status !== undefined) dbData.status = bungalow.status;
    if (bungalow.capacity !== undefined) dbData.capacity = bungalow.capacity;
    if (bungalow.pricePerNight !== undefined) dbData.price_per_night = bungalow.pricePerNight;
    if (bungalow.amenities !== undefined) dbData.amenities = bungalow.amenities;
    if (bungalow.imageUrl !== undefined) dbData.image_url = bungalow.imageUrl;
    if (bungalow.description !== undefined) dbData.description = bungalow.description;
    return dbData;
};


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

                setBungalows((bungalowsData as any[]).map(mapDbToBungalow) || []);
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

        // --- REALTIME SUBSCRIPTIONS ---
        const handleInserts = <T extends {id: string}>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>, mapper?: (item: any) => T) => {
            const newItem = mapper ? mapper(payload.new) : (payload.new as T);
            setter(prev => {
                if (prev.find(item => item.id === newItem.id)) return prev;
                return [...prev, newItem];
            });
        };

        const handleUpdates = <T extends {id: string}>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>, mapper?: (item: any) => T) => {
            const updatedItem = mapper ? mapper(payload.new) : (payload.new as T);
            setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        };

        const handleDeletes = <T extends {id: string}>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
            const oldId = (payload.old as any).id;
            setter(prev => prev.filter(item => item.id !== oldId));
        };
        
        const createSubscription = <T extends {id: string}>(table: string, setter: React.Dispatch<React.SetStateAction<T[]>>, mapper?: (dbItem: any) => T) => {
            return supabase.channel(`${table}-changes`)
              .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => handleInserts(payload, setter, mapper))
              .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => handleUpdates(payload, setter, mapper))
              .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload) => handleDeletes(payload, setter))
              .subscribe();
        };

        const bungalowChannel = createSubscription('bungalows', setBungalows, mapDbToBungalow);
        const clientChannel = createSubscription('clients', setClients);
        const reservationChannel = createSubscription('reservations', setReservations);
        const invoiceChannel = createSubscription('invoices', setInvoices);
        const maintenanceChannel = createSubscription('maintenance_requests', setMaintenanceRequests);
        const communicationChannel = createSubscription('communication_logs', setCommunicationLogs);
        const loyaltyChannel = createSubscription('loyalty_logs', setLoyaltyLogs);

        return () => {
            supabase.removeChannel(bungalowChannel);
            supabase.removeChannel(clientChannel);
            supabase.removeChannel(reservationChannel);
            supabase.removeChannel(invoiceChannel);
            supabase.removeChannel(maintenanceChannel);
            supabase.removeChannel(communicationChannel);
            supabase.removeChannel(loyaltyChannel);
        };
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

    const createCrudOperations = <T extends {id: string}>(table: string) => ({
        add: async (data: Partial<T>): Promise<MutationResult<T>> => {
            const { id, ...insertData } = data;
            const { data: newItems, error } = await supabase.from(table).insert(insertData as any).select();
            
            if (error) {
                console.error(`Error adding to ${table}:`, error);
                return { success: false, error };
            }
            if (!newItems || newItems.length === 0) {
                 console.warn(`Insert to ${table} succeeded but returned no data, likely due to RLS. Realtime listener will handle UI update.`);
            }
            return { success: true, error: null, data: newItems?.[0] as T };
        },
        update: async (data: Partial<T>): Promise<MutationResult<T>> => {
            const { data: updatedItems, error } = await supabase.from(table).update(data as any).eq('id', data.id).select();
             if (error) {
                console.error(`Error updating ${table}:`, error);
                return { success: false, error };
            }
            if (!updatedItems || updatedItems.length === 0) {
                console.warn(`Update to ${table} succeeded but returned no data, likely due to RLS. Realtime listener will handle UI update.`);
            }
            return { success: true, error: null, data: updatedItems?.[0] as T };
        },
        delete: async (id: string): Promise<MutationResult<null>> => {
            const { error } = await supabase.from(table).delete().eq('id', id);
             if (error) {
                console.error(`Error deleting from ${table}:`, error);
                return { success: false, error };
            }
            return { success: true, error: null };
        },
    });

    // --- Specific Bungalow Operations with Mapping ---
    const addBungalow = async (bungalow: Partial<Bungalow>): Promise<MutationResult<Bungalow>> => {
        const { id, ...insertData } = mapBungalowToDb(bungalow);
        const { data: newItems, error } = await supabase.from('bungalows').insert(insertData).select();
        if (error) {
            console.error(`Error adding to bungalows:`, error);
            return { success: false, error };
        }
        if (!newItems || newItems.length === 0) {
             console.warn(`Insert to bungalows succeeded but returned no data, likely due to RLS. Realtime listener will handle UI update.`);
        }
        return { success: true, error: null, data: newItems?.[0] ? mapDbToBungalow(newItems[0]) : null };
    };

    const updateBungalow = async (bungalow: Partial<Bungalow>): Promise<MutationResult<Bungalow>> => {
        const dbData = mapBungalowToDb(bungalow);
        const { data: updatedItems, error } = await supabase.from('bungalows').update(dbData).eq('id', bungalow.id).select();
        if (error) {
            console.error(`Error updating bungalows:`, error);
            return { success: false, error };
        }
        if (!updatedItems || updatedItems.length === 0) {
            console.warn(`Update to bungalows succeeded but returned no data, likely due to RLS. Realtime listener will handle UI update.`);
        }
        return { success: true, error: null, data: updatedItems?.[0] ? mapDbToBungalow(updatedItems[0]) : null };
    };
    
    const deleteBungalow = createCrudOperations<Bungalow>('bungalows').delete;

    const updateBungalowStatus = async (bungalowId: string, status: BungalowStatus): Promise<MutationResult<Bungalow>> => {
        const { data: updatedItems, error } = await supabase.from('bungalows').update({ status }).eq('id', bungalowId).select();
        if (error) {
            console.error(`Error updating bungalow status:`, error);
            return { success: false, error };
        }
        if (!updatedItems || updatedItems.length === 0) {
            console.warn(`Update to bungalow status succeeded but returned no data, likely due to RLS. Realtime listener will handle UI update.`);
        }
        return { success: true, error: null, data: updatedItems?.[0] ? mapDbToBungalow(updatedItems[0]) : null };
    };
    // --- End Specific Bungalow Operations ---

    // FIX: Add explicit generic types to the CRUD operation creators to ensure correct return types.
    const clientOps = createCrudOperations<Client>('clients');
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
        if (error) return { success: false, error };
        return { success: true, error: null, data: newInvoices };
    };
    

    const value: DataContextType = useMemo(() => ({
        bungalows,
        addBungalow,
        updateBungalow,
        updateBungalowStatus,
        deleteBungalow,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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