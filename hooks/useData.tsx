// hooks/useData.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Bungalow, Client, Reservation, Invoice, MaintenanceRequest, BungalowStatus } from '../types';
import { MOCK_BUNGALOWS, MOCK_CLIENTS, MOCK_RESERVATIONS, MOCK_INVOICES, MOCK_MAINTENANCE_REQUESTS } from '../constants';
import { useAuth } from './useAuth';

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
    updateReservation: (res: Reservation) => void;
    addReservation: (res: Reservation) => void;

    invoices: Invoice[];
    updateInvoice: (inv: Invoice) => void;
    addInvoices: (invs: Invoice[]) => void;
    
    maintenanceRequests: MaintenanceRequest[];
    updateMaintenanceRequest: (req: MaintenanceRequest) => void;
    addMaintenanceRequest: (req: MaintenanceRequest) => void;
    deleteMaintenanceRequest: (reqId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings } = useAuth(); // Access settings for automation rules
    const [bungalows, setBungalows] = useState<Bungalow[]>(MOCK_BUNGALOWS);
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(MOCK_MAINTENANCE_REQUESTS);

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
    // This effect should run when the app loads or settings change.
    // We don't add reservations/bungalows to dependencies to prevent potential loops on frequent data changes.
    }, [settings.bungalows.automation.enableAutoCleaning]);
    
    // Bungalows
    const updateBungalow = (bungalow: Bungalow) => setBungalows(prev => prev.map(b => b.id === bungalow.id ? bungalow : b));
    const addBungalow = (bungalow: Bungalow) => setBungalows(prev => [bungalow, ...prev]);
    const deleteBungalow = (bungalowId: string) => setBungalows(prev => prev.filter(b => b.id !== bungalowId));

    // Clients
    const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
    const addClient = (client: Client) => setClients(prev => [client, ...prev]);
    const deleteClient = (clientId: string) => setClients(prev => prev.filter(c => c.id !== clientId));

    // Reservations
    const updateReservation = (res: Reservation) => setReservations(prev => prev.map(r => r.id === res.id ? res : r));
    const addReservation = (res: Reservation) => setReservations(prev => [...prev, res]);

    // Invoices
    const updateInvoice = (inv: Invoice) => setInvoices(prev => prev.map(i => i.id === inv.id ? inv : i));
    const addInvoices = (invs: Invoice[]) => setInvoices(prev => [...invs, ...prev]);

    // Maintenance
    const updateMaintenanceRequest = (req: MaintenanceRequest) => setMaintenanceRequests(prev => prev.map(r => r.id === req.id ? req : r));
    const addMaintenanceRequest = (req: MaintenanceRequest) => setMaintenanceRequests(prev => [req, ...prev]);
    const deleteMaintenanceRequest = (reqId: string) => setMaintenanceRequests(prev => prev.filter(r => r.id !== reqId));

    const value: DataContextType = {
        bungalows, updateBungalow, addBungalow, deleteBungalow,
        clients, updateClient, addClient, deleteClient,
        reservations, updateReservation, addReservation,
        invoices, updateInvoice, addInvoices,
        maintenanceRequests, updateMaintenanceRequest, addMaintenanceRequest, deleteMaintenanceRequest
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