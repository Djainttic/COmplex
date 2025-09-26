// components/pages/BillingPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Invoice, InvoiceStatus, Reservation, ReservationStatus, Client, Bungalow } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Button from '../ui/Button';
import InvoiceFilters from '../billing/InvoiceFilters';
import InvoiceTable from '../billing/InvoiceTable';
import InvoiceDetailsModal from '../billing/InvoiceDetailsModal';
import InvoiceFormModal from '../billing/InvoiceFormModal';
import SelectReservationsModal from '../billing/SelectReservationsModal';
import MonthlyRevenueChart from '../billing/MonthlyRevenueChart';

const BillingPage: React.FC = () => {
    const { hasPermission, settings } = useAuth();
    const { 
        invoices, clients, reservations, bungalows,
        fetchInvoices, fetchClients, fetchReservations, fetchBungalows, 
        addInvoice, updateInvoice, isLoading 
    } = useData();

    const [filters, setFilters] = useState({ searchTerm: '', status: 'all', startDate: '', endDate: '' });
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [selectedBungalow, setSelectedBungalow] = useState<Bungalow | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isSelectResModalOpen, setSelectResModalOpen] = useState(false);

    useEffect(() => {
        fetchInvoices();
        fetchClients();
        fetchReservations();
        fetchBungalows();
    }, [fetchInvoices, fetchClients, fetchReservations, fetchBungalows]);

    const handleFilterChange = useCallback((newFilters: typeof filters) => {
        setFilters(newFilters);
    }, []);

    const filteredInvoices = useMemo(() => {
        const clientMap = new Map(clients.map(c => [c.id, c.name.toLowerCase()]));
        return invoices.filter(invoice => {
            const clientName = clientMap.get(invoice.clientId) || '';
            const searchMatch = filters.searchTerm 
                ? invoice.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) || clientName.includes(filters.searchTerm.toLowerCase())
                : true;
            const statusMatch = filters.status !== 'all' ? invoice.status === filters.status : true;
            const date = new Date(invoice.issueDate);
            const startMatch = filters.startDate ? date >= new Date(filters.startDate) : true;
            const endMatch = filters.endDate ? date <= new Date(filters.endDate) : true;
            return searchMatch && statusMatch && startMatch && endMatch;
        });
    }, [invoices, clients, filters]);

    const handleViewDetails = (invoice: Invoice) => {
        const client = clients.find(c => c.id === invoice.clientId);
        const reservation = reservations.find(r => r.id === invoice.reservationId);
        const bungalow = bungalows.find(b => b.id === reservation?.bungalowId);
        
        if (client && bungalow) {
            setSelectedInvoice(invoice);
            setSelectedClient(client);
            setSelectedBungalow(bungalow);
            setDetailsModalOpen(true);
        } else {
            alert("Données associées à la facture introuvables.");
        }
    };
    
    const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
        const invoiceToUpdate = invoices.find(i => i.id === invoiceId);
        if (invoiceToUpdate) {
            await updateInvoice({ ...invoiceToUpdate, status });
        }
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setFormModalOpen(true);
    };

    const handleSaveInvoice = async (invoice: Invoice) => {
        if (invoice.id) {
            await updateInvoice(invoice);
        } else {
            await addInvoice(invoice);
        }
        setFormModalOpen(false);
        setEditingInvoice(null);
    };
    
    const reservationsToInvoice = useMemo(() => {
        const invoicedReservationIds = new Set(invoices.map(i => i.reservationId));
        return reservations.filter(r => r.status === ReservationStatus.Confirmed && !invoicedReservationIds.has(r.id));
    }, [reservations, invoices]);
    
    const handleGenerateInvoices = async (selectedReservations: Reservation[]) => {
        for (const res of selectedReservations) {
            const bungalow = bungalows.find(b => b.id === res.bungalowId);
            const nights = Math.ceil((new Date(res.endDate).getTime() - new Date(res.startDate).getTime()) / (1000 * 3600 * 24));

            const newInvoice: Omit<Invoice, 'id'> = {
                reservationId: res.id,
                clientId: res.clientId,
                issueDate: new Date().toISOString(),
                dueDate: new Date(res.endDate).toISOString(),
                totalAmount: res.totalPrice,
                status: InvoiceStatus.Unpaid,
                items: [{
                    description: `Séjour ${bungalow?.name || ''} - ${nights} nuit(s)`,
                    quantity: nights,
                    unitPrice: res.totalPrice / nights,
                    total: res.totalPrice,
                }]
            };
            await addInvoice(newInvoice);
        }
        setSelectResModalOpen(false);
    };

    const monthlyRevenueData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const data = monthNames.map(month => ({ month, revenue: 0 }));
        invoices.forEach(inv => {
            if (inv.status === InvoiceStatus.Paid && new Date(inv.issueDate).getFullYear() === currentYear) {
                const monthIndex = new Date(inv.issueDate).getMonth();
                data[monthIndex].revenue += inv.totalAmount;
            }
        });
        return data;
    }, [invoices]);
    
    const showLoading = isLoading.invoices || isLoading.clients;

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facturation</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Gérez et suivez les factures de vos clients.
                    </p>
                </div>
                {hasPermission('billing:write') && (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setSelectResModalOpen(true)}>
                            Facturer depuis une réservation
                        </Button>
                        <Button onClick={() => { setEditingInvoice(null); setFormModalOpen(true); }}>
                            Créer une facture manuelle
                        </Button>
                    </div>
                )}
            </div>
            
            <MonthlyRevenueChart data={monthlyRevenueData} currency={settings.financial.currency}/>

            <InvoiceFilters onFilterChange={handleFilterChange} />
            
            {showLoading ? (
                 <div className="text-center py-12">Chargement des factures...</div>
            ) : (
                <InvoiceTable 
                    invoices={filteredInvoices}
                    clients={clients}
                    onView={handleViewDetails}
                    onUpdateStatus={handleUpdateStatus}
                    onEdit={handleEditInvoice}
                />
            )}
            
            {isDetailsModalOpen && selectedInvoice && selectedBungalow && selectedClient && (
                <InvoiceDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    invoiceData={{
                        invoice: selectedInvoice,
                        bungalow: selectedBungalow,
                        client: selectedClient
                    }}
                />
            )}
            
            {isFormModalOpen && (
                <InvoiceFormModal 
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveInvoice}
                    invoice={editingInvoice}
                    clients={clients}
                    reservations={reservations}
                />
            )}
            
            {isSelectResModalOpen && (
                <SelectReservationsModal
                    isOpen={isSelectResModalOpen}
                    onClose={() => setSelectResModalOpen(false)}
                    onGenerate={handleGenerateInvoices}
                    reservationsToInvoice={reservationsToInvoice}
                    clients={clients}
                    bungalows={bungalows}
                />
            )}
        </div>
    );
};

export default BillingPage;
