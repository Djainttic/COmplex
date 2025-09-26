import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Invoice, InvoiceStatus, ReservationStatus, Reservation, LoyaltyLogType } from '../../types';
import InvoiceTable from '../billing/InvoiceTable';
import InvoiceDetailsModal from '../billing/InvoiceDetailsModal';
import InvoiceFilters from '../billing/InvoiceFilters';
import Button from '../ui/Button';
import SelectReservationsModal from '../billing/SelectReservationsModal';
import StatCard from '../ui/StatCard';
import InvoiceFormModal from '../billing/InvoiceFormModal';
import MonthlyRevenueChart from '../billing/MonthlyRevenueChart';

const BillingPage: React.FC = () => {
    const { currentUser, hasPermission, settings } = useAuth();
    const { 
        invoices, addInvoice, addInvoices, updateInvoice,
        clients, updateClient, 
        reservations, bungalows,
        addLoyaltyLog,
        fetchInvoices, fetchClients, fetchReservations, fetchBungalows, fetchLoyaltyLogs, isLoading
    } = useData();

    useEffect(() => {
        fetchInvoices();
        fetchClients();
        fetchReservations();
        fetchBungalows();
        fetchLoyaltyLogs();
    }, [fetchInvoices, fetchClients, fetchReservations, fetchBungalows, fetchLoyaltyLogs]);


    const [filters, setFilters] = useState({
        searchTerm: '',
        status: 'all',
        startDate: '',
        endDate: '',
    });
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isSelectReservationsModalOpen, setSelectReservationsModalOpen] = useState(false);

    const canWrite = hasPermission('billing:write');

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };
    
    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setFormModalOpen(true);
    };
    
    const handleCreateManualInvoice = () => {
        setEditingInvoice(null);
        setFormModalOpen(true);
    };

    const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
        if (!canWrite) return;
        const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
        if (!invoiceToUpdate || invoiceToUpdate.status === status) return;

        try {
            const updateResult = await updateInvoice({ ...invoiceToUpdate, status });
            if (!updateResult.success) throw new Error("La mise à jour du statut de la facture a échoué.");

            if (status === InvoiceStatus.Paid && settings.loyalty.enabled) {
                const reservation = reservations.find(r => r.id === invoiceToUpdate.reservationId);
                const client = clients.find(c => c.id === invoiceToUpdate.clientId);
                if (!reservation || !client) {
                    console.warn(`Invoice ${invoiceId} paid, but client or reservation not found for loyalty points.`);
                    return;
                }

                const nights = Math.max(1, Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 3600 * 24)));
                const pointsForStay = nights * settings.loyalty.pointsPerNight;
                
                const previouslyPaidInvoices = invoices.filter(inv => inv.clientId === client.id && inv.status === InvoiceStatus.Paid && inv.id !== invoiceToUpdate.id);
                const isFirstPaidReservation = previouslyPaidInvoices.length === 0;
                const bonusPoints = isFirstPaidReservation ? settings.loyalty.pointsForFirstReservation : 0;
                
                let totalPointsToAdd = 0;
                
                if (pointsForStay > 0) {
                    await addLoyaltyLog({
                        clientId: client.id, type: LoyaltyLogType.Earned, pointsChange: pointsForStay,
                        reason: `Points pour séjour (${nights} nuits)`, relatedId: reservation.id,
                        timestamp: new Date().toISOString()
                    });
                    totalPointsToAdd += pointsForStay;
                }
                
                if (bonusPoints > 0) {
                    await addLoyaltyLog({
                        clientId: client.id, type: LoyaltyLogType.InitialBonus, pointsChange: bonusPoints,
                        reason: 'Bonus de première réservation', relatedId: reservation.id,
                        timestamp: new Date().toISOString()
                    });
                    totalPointsToAdd += bonusPoints;
                }

                if (totalPointsToAdd > 0) {
                    await updateClient({ ...client, loyaltyPoints: (client.loyaltyPoints || 0) + totalPointsToAdd });
                    alert(`Facture marquée comme payée. ${totalPointsToAdd} points de fidélité ont été ajoutés à ${client.name}.`);
                } else {
                     alert(`Facture marquée comme payée.`);
                }
            } else {
                alert(`Statut de la facture mis à jour.`);
            }
        } catch (error: any) {
            console.error("Transaction failed:", error);
            alert(`Une erreur est survenue lors de la mise à jour : ${error.message}.`);
            await updateInvoice({ ...invoiceToUpdate, status: invoiceToUpdate.status });
        }
    };
    
    const unvoicedConfirmedReservations = useMemo(() => {
        const invoicedReservationIds = new Set(invoices.map(inv => inv.reservationId));
        return reservations.filter(
            res => res.status === ReservationStatus.Confirmed && !invoicedReservationIds.has(res.id)
        );
    }, [invoices, reservations]);

    const handleCreateInvoices = async (selectedReservations: Reservation[]) => {
        const newInvoices: Partial<Invoice>[] = selectedReservations.map(reservation => {
            const nights = Math.max(1, Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 3600 * 24)));
            const bungalow = bungalows.find(b => b.id === reservation.bungalowId);
            return {
                reservationId: reservation.id,
                clientId: reservation.clientId,
                issueDate: new Date().toISOString(),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                totalAmount: reservation.totalPrice,
                status: InvoiceStatus.Unpaid,
                items: [{
                    description: `Séjour Bungalow "${bungalow?.name || 'N/A'}" (${nights} nuits)`,
                    quantity: nights, unitPrice: bungalow?.pricePerNight || 0,
                    total: reservation.totalPrice,
                }]
            };
        });
        
        if (newInvoices.length > 0) {
            const result = await addInvoices(newInvoices);
            if(result.success) alert(`${newInvoices.length} facture(s) générée(s) avec succès.`);
            else alert(`Erreur lors de la génération des factures: ${result.error?.message || 'Erreur inconnue'}`);
        }
        setSelectReservationsModalOpen(false);
    };

     const handleSaveInvoice = async (invoiceToSave: Invoice) => {
        let result = invoiceToSave.id ? await updateInvoice(invoiceToSave) : await addInvoice(invoiceToSave);
        if (result.success) {
            setFormModalOpen(false);
            setEditingInvoice(null);
        } else {
            alert(`Erreur lors de la sauvegarde de la facture : ${result.error?.message || 'Erreur inconnue'}`);
        }
    };
    
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

    const filteredInvoices = useMemo(() => {
        const lowerCaseSearchTerm = filters.searchTerm.toLowerCase();
        return invoices.filter(inv => {
            const client = clientMap.get(inv.clientId);
            const statusMatch = filters.status === 'all' || inv.status === filters.status;
            const searchMatch = !lowerCaseSearchTerm || 
                inv.id.toLowerCase().includes(lowerCaseSearchTerm) ||
                (client && client.name.toLowerCase().includes(lowerCaseSearchTerm));
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            if(startDate) startDate.setHours(0,0,0,0);
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if(endDate) endDate.setHours(23,59,59,999);
            const dateMatch = (!startDate || new Date(inv.issueDate) >= startDate) && (!endDate || new Date(inv.issueDate) <= endDate);
            return statusMatch && searchMatch && dateMatch;
        });
    }, [invoices, filters, clientMap]);

    const stats = useMemo(() => {
        const totalInvoiced = filteredInvoices.reduce((sum, inv) => inv.status !== InvoiceStatus.Cancelled ? sum + inv.totalAmount : sum, 0);
        const totalPaid = filteredInvoices.reduce((sum, inv) => inv.status === InvoiceStatus.Paid ? sum + inv.totalAmount : sum, 0);
        const totalOverdue = filteredInvoices.reduce((sum, inv) => inv.status === InvoiceStatus.Overdue ? sum + inv.totalAmount : sum, 0);
        return { totalInvoiced, totalPaid, totalOverdue };
    }, [filteredInvoices]);

    const monthlyRevenueData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const revenueData = monthNames.map(month => ({ month, revenue: 0 }));
        invoices.filter(inv => new Date(inv.issueDate).getFullYear() === currentYear && inv.status === InvoiceStatus.Paid)
            .forEach(inv => {
                const monthIndex = new Date(inv.issueDate).getMonth();
                revenueData[monthIndex].revenue += inv.totalAmount;
            });
        return revenueData;
    }, [invoices]);

    const reservationMap = new Map(reservations.map(r => [r.id, r]));
    const bungalowMap = new Map(bungalows.map(b => [b.id, b]));
    
    const selectedInvoiceData = useMemo(() => {
        if (!selectedInvoice) return null;
        const client = clientMap.get(selectedInvoice.clientId);
        const reservation = reservationMap.get(selectedInvoice.reservationId);
        const bungalow = reservation ? bungalowMap.get(reservation.bungalowId) : undefined;
        if (!client || !bungalow) return null;
        return { invoice: selectedInvoice, client, bungalow };
    }, [selectedInvoice, clientMap, reservationMap, bungalowMap]);

    const icons = {
        total: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        paid: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        overdue: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    
    const showLoading = (isLoading.invoices || isLoading.clients) && invoices.length === 0;

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facturation</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Gérez et suivez les factures de vos clients.
                    </p>
                </div>
                 {canWrite && (
                     <div className="flex space-x-2">
                        <Button variant="secondary" onClick={handleCreateManualInvoice}>Créer une facture manuelle</Button>
                        <Button onClick={() => setSelectReservationsModalOpen(true)}>Générer depuis une réservation</Button>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Total Facturé (période)" value={`${stats.totalInvoiced.toLocaleString('fr-FR')} ${settings.financial.currency}`} icon={icons.total} />
                <StatCard title="Total Encaissé (période)" value={`${stats.totalPaid.toLocaleString('fr-FR')} ${settings.financial.currency}`} icon={icons.paid} />
                <StatCard title="Total en Retard (période)" value={`${stats.totalOverdue.toLocaleString('fr-FR')} ${settings.financial.currency}`} icon={icons.overdue} />
            </div>

            {showLoading ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">Chargement des données de facturation...</div>
            ) : (
                <>
                    <MonthlyRevenueChart data={monthlyRevenueData} currency={settings.financial.currency} />
                    <InvoiceFilters onFilterChange={setFilters} />
                    <InvoiceTable 
                        invoices={filteredInvoices}
                        clients={clients}
                        onView={handleViewInvoice}
                        onUpdateStatus={handleUpdateStatus}
                        onEdit={handleEditInvoice}
                    />
                </>
            )}

            {isDetailsModalOpen && selectedInvoiceData && (
                <InvoiceDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    invoiceData={selectedInvoiceData}
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

            {isSelectReservationsModalOpen && (
                <SelectReservationsModal
                    isOpen={isSelectReservationsModalOpen}
                    onClose={() => setSelectReservationsModalOpen(false)}
                    onGenerate={handleCreateInvoices}
                    reservationsToInvoice={unvoicedConfirmedReservations}
                    clients={clients}
                    bungalows={bungalows}
                />
            )}
        </div>
    );
};

export default BillingPage;
