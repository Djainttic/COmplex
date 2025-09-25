// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bungalow, Client, Reservation, Invoice, MaintenanceRequest, BungalowStatus, CommunicationLog, LoyaltyLog, ReservationStatus } from '../types';
import { MOCK_BUNGALOWS, MOCK_CLIENTS, MOCK_RESERVATIONS, MOCK_INVOICES, MOCK_MAINTENANCE_REQUESTS, MOCK_LOYALTY_LOGS } from '../constants';
import { useAuth } from './useAuth';

// Helper hook to sync state with localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    };
    return [storedValue, setValue];
}


const MOCK_COMMUNICATION_LOGS: CommunicationLog[] = [
    {
        id: 'comm-1',
        recipients: ['client-1', 'client-2'],
        subject: 'Offre Spéciale Week-end',
        body: 'Profitez de 20% de réduction sur tous nos bungalows ce week-end ! Réservez dès maintenant.',
        sentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Envoyé',
        sentBy: 'user-manager',
    },
    {
        id: 'comm-2',
        recipients: ['client-3'],
        subject: 'Rappel de Maintenance',
        body: 'Bonjour, une maintenance est prévue dans votre zone demain matin. Merci de votre compréhension.',
        sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Envoyé',
        sentBy: 'user-admin',
    },
];

interface DataContextType {
    bungalows: Bungalow[];
    updateBungalow: (bungalow: Bungalow) => void;
    addBungalow: (bungalow: Bungalow) => void;
    deleteBungalow: (bungalowId: string) => void;
    
    clients: Client[];
    updateClient: (client: Client) => void;
    addClient: (client: Client) => void;
    deleteClient: (clientId: string) => void;

    reservations: Reservation[];
    updateReservation: (res: Reservation) => Promise<boolean>;
    addReservation: (res: Reservation) => Promise<boolean>;

    invoices: Invoice[];
    updateInvoice: (inv: Invoice) => void;
    addInvoice: (inv: Invoice) => void;
    addInvoices: (invs: Invoice[]) => void;
    deleteInvoice: (invoiceId: string) => void;
    
    maintenanceRequests: MaintenanceRequest[];
    updateMaintenanceRequest: (req: MaintenanceRequest) => void;
    addMaintenanceRequest: (req: MaintenanceRequest) => void;
    deleteMaintenanceRequest: (reqId: string) => void;

    communicationLogs: CommunicationLog[];
    addCommunicationLog: (log: CommunicationLog) => void;
    
    loyaltyLogs: LoyaltyLog[];
    addLoyaltyLog: (log: LoyaltyLog) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useAuth(); // Access settings for automation rules
    
    const [bungalows, setBungalows] = useLocalStorage<Bungalow[]>('bungalows_data', MOCK_BUNGALOWS);
    const [clients, setClients] = useLocalStorage<Client[]>('clients_data', MOCK_CLIENTS);
    const [reservations, setReservations] = useLocalStorage<Reservation[]>('reservations_data', MOCK_RESERVATIONS);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices_data', MOCK_INVOICES);
    const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage<MaintenanceRequest[]>('maintenance_data', MOCK_MAINTENANCE_REQUESTS);
    const [communicationLogs, setCommunicationLogs] = useLocalStorage<CommunicationLog[]>('communication_data', MOCK_COMMUNICATION_LOGS);
    const [loyaltyLogs, setLoyaltyLogs] = useLocalStorage<LoyaltyLog[]>('loyalty_logs_data', MOCK_LOYALTY_LOGS);

    // Automation effect for bungalow status
    useEffect(() => {
        if (settings.bungalows.automation.enableAutoCleaning) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const bungalowUpdates = new Map<string, BungalowStatus>();

            reservations.forEach(res => {
                const endDate = new Date(res.endDate);
                if (endDate < today) {
                    const bungalow = bungalows.find(b => b.id === res.bungalowId);
                    if (bungalow && bungalow.status === BungalowStatus.Occupied) {
                        bungalowUpdates.set(bungalow.id, BungalowStatus.Cleaning);
                    }
                }
            });

            if (bungalowUpdates.size > 0) {
                console.log(`Automation: Updating ${bungalowUpdates.size} bungalows to 'Cleaning' status.`);
                setBungalows(prev =>
                    prev.map(b => bungalowUpdates.has(b.id) ? { ...b, status: bungalowUpdates.get(b.id)! } : b)
                );
            }
        }
    }, [settings.bungalows.automation.enableAutoCleaning]);
    
    const isBungalowAvailable = (bungalowId: string, startDate: string, endDate: string, currentReservationId: string | null): boolean => {
        const newStart = new Date(startDate).getTime();
        const newEnd = new Date(endDate).getTime();

        const conflictingReservation = reservations.find(res => {
            if (res.bungalowId !== bungalowId || res.id === currentReservationId || res.status === ReservationStatus.Cancelled) {
                return false;
            }
            const existingStart = new Date(res.startDate).getTime();
            const existingEnd = new Date(res.endDate).getTime();
            
            // Check for overlap: (StartA < EndB) and (EndA > StartB)
            return newStart < existingEnd && newEnd > existingStart;
        });

        return !conflictingReservation;
    };

    // Bungalows
    const updateBungalow = (bungalow: Bungalow) => setBungalows(prev => prev.map(b => b.id === bungalow.id ? bungalow : b));
    const addBungalow = (bungalow: Bungalow) => setBungalows(prev => [bungalow, ...prev]);
    const deleteBungalow = (bungalowId: string) => setBungalows(prev => prev.filter(b => b.id !== bungalowId));

    // Clients
    const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
    const addClient = (client: Client) => setClients(prev => [client, ...prev]);
    const deleteClient = (clientId: string) => setClients(prev => prev.filter(c => c.id !== clientId));

    // Reservations
    const updateReservation = async (res: Reservation): Promise<boolean> => {
        if (!isBungalowAvailable(res.bungalowId, res.startDate, res.endDate, res.id)) {
            alert("Erreur : Ce bungalow est déjà réservé pour ces dates.");
            return false;
        }
        setReservations(prev => prev.map(r => (r.id === res.id ? res : r)));
        if(res.status === ReservationStatus.Confirmed) {
            updateBungalowStatusOnReservation(res.bungalowId, res.startDate, res.endDate);
        }
        return true;
    };

    const addReservation = async (res: Reservation): Promise<boolean> => {
        if (!isBungalowAvailable(res.bungalowId, res.startDate, res.endDate, null)) {
            alert("Erreur : Ce bungalow est déjà réservé pour ces dates.");
            return false;
        }
        setReservations(prev => [...prev, res]);
        if(res.status === ReservationStatus.Confirmed) {
            updateBungalowStatusOnReservation(res.bungalowId, res.startDate, res.endDate);
        }
        return true;
    };
    
    const updateBungalowStatusOnReservation = (bungalowId: string, startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        if (today >= start && today < end) {
            setBungalows(prev => prev.map(b => 
                b.id === bungalowId ? { ...b, status: BungalowStatus.Occupied } : b
            ));
        }
    };


    // Invoices
    const updateInvoice = (inv: Invoice) => setInvoices(prev => prev.map(i => i.id === inv.id ? inv : i));
    const addInvoice = (inv: Invoice) => setInvoices(prev => [inv, ...prev]);
    const addInvoices = (invs: Invoice[]) => setInvoices(prev => [...invs, ...prev]);
    const deleteInvoice = (invoiceId: string) => setInvoices(prev => prev.filter(i => i.id !== invoiceId));

    // Maintenance
    const updateMaintenanceRequest = (req: MaintenanceRequest) => setMaintenanceRequests(prev => prev.map(r => r.id === req.id ? req : r));
    const addMaintenanceRequest = (req: MaintenanceRequest) => setMaintenanceRequests(prev => [req, ...prev]);
    const deleteMaintenanceRequest = (reqId: string) => setMaintenanceRequests(prev => prev.filter(r => r.id !== reqId));

    // Communication
    const addCommunicationLog = (log: CommunicationLog) => setCommunicationLogs(prev => [log, ...prev]);

    // Loyalty
    const addLoyaltyLog = (log: LoyaltyLog) => setLoyaltyLogs(prev => [log, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));


    const value: DataContextType = {
        bungalows, updateBungalow, addBungalow, deleteBungalow,
        clients, updateClient, addClient, deleteClient,
        reservations, updateReservation, addReservation,
        invoices, updateInvoice, addInvoice, addInvoices, deleteInvoice,
        maintenanceRequests, updateMaintenanceRequest, addMaintenanceRequest, deleteMaintenanceRequest,
        communicationLogs, addCommunicationLog,
        loyaltyLogs, addLoyaltyLog,
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