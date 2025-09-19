import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Invoice, InvoiceStatus, ReservationStatus, Client, Reservation, Bungalow } from '../../types';
import InvoiceTable from '../billing/InvoiceTable';
import InvoiceDetailsModal from '../billing/InvoiceDetailsModal';
import InvoiceFilters from '../billing/InvoiceFilters';
import Button from '../ui/Button';
import SelectReservationsModal from '../billing/SelectReservationsModal';

const BillingPage: React.FC = () => {
    const { hasPermission, settings } = useAuth();
    const { 
        invoices, addInvoices, updateInvoice,
        clients, updateClient, 
        reservations, bungalows 
    } = useData();

    const [filters, setFilters] = useState({
        searchTerm: '',
        status: 'all',
        startDate: '',
        endDate: '',
    });
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isSelectReservationsModalOpen, setSelectReservationsModalOpen] = useState(false);

    const canWrite = hasPermission('billing:write');

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };

    const handleUpdateStatus = (invoiceId: string, status: InvoiceStatus) => {
        if (!canWrite) return;

        const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
        // Prevent re-processing if already paid
        if (!invoiceToUpdate || (invoiceToUpdate.status === InvoiceStatus.Paid && status === InvoiceStatus.Paid)) return;

        // FIX: The original logic to update invoices was inefficient and buggy.
        // It has been replaced with a single, direct call to updateInvoice.
        updateInvoice({ ...invoiceToUpdate, status });

        if (status !== InvoiceStatus.Paid) {
            return;
        }

        // --- Loyalty Points Logic ---
        if (settings.loyalty.enabled) {
            const reservation = reservations.find(r => r.id === invoiceToUpdate.reservationId);
            const client = clients.find(c => c.id === invoiceToUpdate.clientId);

            if (!reservation || !client) {
                console.error("Could not find reservation or client for loyalty points attribution.");
                alert(`Facture marquée comme payée.`); // Still give feedback
                return;
            }

            // 1. Calculate points for this stay
            const nights = Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 3600 * 24));
            const pointsForStay = (nights > 0 ? nights : 1) * settings.loyalty.pointsPerNight;

            // 2. Check for first reservation bonus
            // This check correctly uses the `invoices` state from before this update.
            const previouslyPaidInvoices = invoices.filter(inv =>
                inv.clientId === client.id &&
                inv.status === InvoiceStatus.Paid
            );
            const isFirstPaidReservation = previouslyPaidInvoices.length === 0;
            const bonusPoints = isFirstPaidReservation ? settings.loyalty.pointsForFirstReservation : 0;
            
            const totalPointsToAdd = pointsForStay + bonusPoints;

            if (totalPointsToAdd > 0) {
                // 3. Update client object
                updateClient({
                    ...client,
                    loyaltyPoints: client.loyaltyPoints + totalPointsToAdd
                });
                // 4. User feedback
                alert(`Facture marquée comme payée. ${totalPointsToAdd} points de fidélité ont été ajoutés au compte de ${client.name}.`);
            } else {
                alert(`Facture marquée comme payée.`);
            }
        } else {
             alert(`Facture marquée comme payée.`);
        }
    };
    
    const unvoicedConfirmedReservations = useMemo(() => {
        const invoicedReservationIds = new Set(invoices.map(inv => inv.reservationId));
        return reservations.filter(
            res => res.status === ReservationStatus.Confirmed && !invoicedReservationIds.has(res.id)
        );
    }, [invoices, reservations]);


    const handleCreateInvoices = (selectedReservations: Reservation[]) => {
        const newInvoices: Invoice[] = [];
        let invoiceCount = invoices.length;

        selectedReservations.forEach(reservation => {
            const client = clients.find(c => c.id === reservation.clientId);
            const bungalow = bungalows.find(b => b.id === reservation.bungalowId);

            if (client && bungalow) {
                const nights = Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 3600 * 24));
                 invoiceCount++;
                const newInvoice: Invoice = {
                    id: `INV-2024-${(invoiceCount).toString().padStart(3, '0')}`,
                    reservationId: reservation.id,
                    clientId: reservation.clientId,
                    issueDate: new Date().toISOString(),
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                    totalAmount: reservation.totalPrice,
                    status: InvoiceStatus.Unpaid,
                    items: [
                        {
                            description: `Séjour Bungalow "${bungalow.name}" (${nights > 0 ? nights : 1} nuits)`,
                            quantity: nights > 0 ? nights : 1,
                            unitPrice: bungalow.pricePerNight,
                            total: reservation.totalPrice,
                        }
                    ]
                };
                newInvoices.push(newInvoice);
            }
        });
        
        if (newInvoices.length > 0) {
            addInvoices(newInvoices);
            alert(`${newInvoices.length} facture(s) générée(s) avec succès.`);
        }
        
        setSelectReservationsModalOpen(false);
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
            if (startDate) startDate.setHours(0, 0, 0, 0);
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);
            
            const invoiceDate = new Date(inv.issueDate);

            const dateMatch = (!startDate || invoiceDate >= startDate) && (!endDate || invoiceDate <= endDate);

            return statusMatch && searchMatch && dateMatch;
        });
    }, [invoices, filters, clientMap]);

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
                    <Button onClick={() => setSelectReservationsModalOpen(true)}>Générer une facture</Button>
                )}
            </div>
            
            <InvoiceFilters onFilterChange={setFilters} />

            <InvoiceTable 
                invoices={filteredInvoices}
                clients={clients}
                onView={handleViewInvoice}
                onUpdateStatus={handleUpdateStatus}
            />

            {isDetailsModalOpen && selectedInvoiceData && (
                <InvoiceDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    invoiceData={selectedInvoiceData}
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