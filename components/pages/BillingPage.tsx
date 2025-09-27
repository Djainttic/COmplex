// components/pages/BillingPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Added ReservationStatus to fix a type error when filtering reservations.
import { Invoice, Reservation, InvoiceStatus, Bungalow, Client, InvoiceItem, ReservationStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToasts } from '../../hooks/useToasts';
import Button from '../ui/Button';
import InvoiceTable from '../billing/InvoiceTable';
import InvoiceFilters from '../billing/InvoiceFilters';
import InvoiceDetailsModal from '../billing/InvoiceDetailsModal';
import InvoiceFormModal from '../billing/InvoiceFormModal';
import SelectReservationsModal from '../billing/SelectReservationsModal';
import MonthlyRevenueChart from '../billing/MonthlyRevenueChart';

const BillingPage: React.FC = () => {
    const { hasPermission, settings } = useAuth();
    const {
        invoices, reservations, clients, bungalows,
        fetchInvoices, fetchReservations, fetchClients, fetchBungalows,
        addInvoice, updateInvoice, isLoading
    } = useData();
    const { addToast } = useToasts();

    useEffect(() => {
        fetchInvoices();
        fetchReservations();
        fetchClients();
        fetchBungalows();
    }, [fetchInvoices, fetchReservations, fetchClients, fetchBungalows]);

    const [filters, setFilters] = useState({ searchTerm: '', status: 'all', startDate: '', endDate: '' });
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const canWrite = hasPermission('billing:write');

    const filteredInvoices = useMemo(() => {
        const clientNameMap = new Map(clients.map(c => [c.id, c.name.toLowerCase()]));
        return invoices.filter(inv => {
            const clientName = clientNameMap.get(inv.clientId) || '';
            const matchesSearch = filters.searchTerm === '' ||
                inv.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                clientName.includes(filters.searchTerm.toLowerCase());
            
            const matchesStatus = filters.status === 'all' || inv.status === filters.status;
            
            const issueDate = new Date(inv.issueDate);
            const matchesStartDate = filters.startDate === '' || issueDate >= new Date(filters.startDate);
            const matchesEndDate = filters.endDate === '' || issueDate <= new Date(filters.endDate);

            return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
        });
    }, [invoices, clients, filters]);

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setFormModalOpen(true);
    };

    const handleAddInvoice = () => {
        setSelectedInvoice(null);
        setFormModalOpen(true);
    };
    
    const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (invoice) {
            const success = await updateInvoice({ ...invoice, status });
            if (success) {
                addToast({ message: `Statut de la facture mis à jour.`, type: 'info' });
            } else {
                addToast({ message: 'Échec de la mise à jour.', type: 'error' });
            }
        }
    };
    
    const handleSaveInvoice = async (invoice: Invoice) => {
        let success = false;
        if (invoice.id) {
            success = await updateInvoice(invoice);
            if(success) addToast({ message: `Facture #${invoice.id} mise à jour.`, type: 'success' });
        } else {
            success = await addInvoice(invoice);
            if(success) addToast({ message: 'Nouvelle facture créée.', type: 'success' });
        }
        
        if (success) {
            setFormModalOpen(false);
        } else {
            addToast({ message: 'Échec de la sauvegarde de la facture.', type: 'error' });
        }
    };
    
    const reservationsToInvoice = useMemo(() => {
        const invoicedReservationIds = new Set(invoices.map(i => i.reservationId));
        return reservations.filter(r => r.status === ReservationStatus.Confirmed && !invoicedReservationIds.has(r.id));
    }, [reservations, invoices]);

    const handleGenerateFromReservations = async (selectedReservations: Reservation[]) => {
        const promises = selectedReservations.map(res => {
            const bungalow = bungalows.find(b => b.id === res.bungalowId);
            const nights = (new Date(res.endDate).getTime() - new Date(res.startDate).getTime()) / (1000 * 3600 * 24);
            
            const newItem: InvoiceItem = {
                description: `Séjour ${bungalow?.name || ''} - ${nights} nuit(s)`,
                quantity: nights > 0 ? nights : 1,
                unitPrice: nights > 0 ? res.totalPrice / nights : res.totalPrice,
                total: res.totalPrice,
            };
            
            return addInvoice({
                clientId: res.clientId,
                reservationId: res.id,
                items: [newItem],
            } as Partial<Invoice>);
        });

        const results = await Promise.all(promises);
        const successfulCreations = results.filter(Boolean).length;

        if (successfulCreations > 0) {
            addToast({ message: `${successfulCreations} facture(s) générée(s).`, type: 'success' });
        }
        if (successfulCreations < selectedReservations.length) {
             addToast({ message: `Échec de la création pour ${selectedReservations.length - successfulCreations} réservation(s).`, type: 'error' });
        }
        
        setSelectionModalOpen(false);
    };

    const monthlyRevenueData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.Paid && new Date(inv.issueDate).getFullYear() === currentYear);
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
            revenue: 0
        }));
        paidInvoices.forEach(inv => {
            const monthIndex = new Date(inv.issueDate).getMonth();
            monthlyData[monthIndex].revenue += inv.totalAmount;
        });
        return monthlyData;
    }, [invoices]);
    
    const isDataLoading = isLoading.invoices || isLoading.reservations || isLoading.clients || isLoading.bungalows;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facturation</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Gérez les factures, suivez les paiements et générez de nouvelles factures.
                    </p>
                </div>
                {canWrite && (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setSelectionModalOpen(true)} disabled={reservationsToInvoice.length === 0}>
                            Facturer depuis Réservations
                        </Button>
                        <Button onClick={handleAddInvoice}>Créer une facture</Button>
                    </div>
                )}
            </div>
            
            <MonthlyRevenueChart data={monthlyRevenueData} currency={settings.financial.currency} />

            <InvoiceFilters onFilterChange={setFilters} />
            
            {isDataLoading ? (
                 <div className="text-center py-12">Chargement des factures...</div>
            ) : (
                <InvoiceTable 
                    invoices={filteredInvoices} 
                    clients={clients}
                    onView={handleViewInvoice}
                    onUpdateStatus={handleUpdateStatus}
                    onEdit={handleEditInvoice}
                />
            )}

            {isDetailsModalOpen && selectedInvoice && (
                <InvoiceDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    invoiceData={{
                        invoice: selectedInvoice,
                        bungalow: bungalows.find(b => b.id === reservations.find(r => r.id === selectedInvoice.reservationId)?.bungalowId)!,
                        client: clients.find(c => c.id === selectedInvoice.clientId)!
                    }}
                />
            )}
            
             {isFormModalOpen && (
                <InvoiceFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveInvoice}
                    invoice={selectedInvoice}
                    clients={clients}
                    reservations={reservations}
                />
            )}

            {isSelectionModalOpen && (
                <SelectReservationsModal
                    isOpen={isSelectionModalOpen}
                    onClose={() => setSelectionModalOpen(false)}
                    onGenerate={handleGenerateFromReservations}
                    reservationsToInvoice={reservationsToInvoice}
                    clients={clients}
                    bungalows={bungalows}
                />
            )}
        </div>
    );
};

export default BillingPage;