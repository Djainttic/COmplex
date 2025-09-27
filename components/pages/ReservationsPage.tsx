// components/pages/ReservationsPage.tsx
import React, { useState, useEffect } from 'react';
import { Reservation } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToasts } from '../../hooks/useToasts';
import Button from '../ui/Button';
import ReservationsCalendarView from '../reservations/ReservationsCalendarView';
import CalendarMonthView from '../reservations/CalendarMonthView';
import ReservationFormModal from '../reservations/ReservationFormModal';
import ReservationDetailsModal from '../reservations/ReservationDetailsModal';

type ViewMode = 'week' | 'month';

const ReservationsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { 
        reservations, bungalows, clients,
        fetchReservations, fetchBungalows, fetchClients,
        addReservation, updateReservation, isLoading 
    } = useData();
    const { addToast } = useToasts();
    
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Partial<Reservation> | null>(null);

    useEffect(() => {
        fetchReservations();
        fetchBungalows();
        fetchClients();
    }, [fetchReservations, fetchBungalows, fetchClients]);
    
    const canWrite = hasPermission('reservations:write');

    const handleDateChange = (increment: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + (7 * increment));
            } else {
                newDate.setMonth(newDate.getMonth() + increment);
            }
            return newDate;
        });
    };
    
    const handleAddReservation = (bungalowId?: string, date?: Date) => {
        setSelectedReservation({
            bungalowId: bungalowId || '',
            startDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setFormModalOpen(true);
    };

    const handleSelectReservation = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setDetailsModalOpen(true);
    };
    
    const handleSaveReservation = async (res: Reservation) => {
        let success = false;
        if (res.id) { // Editing
            success = await updateReservation(res);
            if(success) addToast({ message: `Réservation mise à jour.`, type: 'success' });
        } else { // Adding
            success = await addReservation(res);
            if(success) addToast({ message: 'Nouvelle réservation ajoutée avec succès.', type: 'success' });
        }
        
        if (success) {
            setFormModalOpen(false);
        } else {
            addToast({ message: "Échec de l'enregistrement de la réservation.", type: 'error' });
        }
    };

    const selectedBungalow = bungalows.find(b => b.id === selectedReservation?.bungalowId);
    const selectedClient = clients.find(c => c.id === selectedReservation?.clientId);

    const isDataLoading = isLoading.reservations || isLoading.bungalows || isLoading.clients;

    const formattedDate = viewMode === 'week'
        ? `Semaine du ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString('fr-FR')}`
        : currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planning des Réservations</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Visualisez et gérez les réservations sur le calendrier.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {canWrite && <Button onClick={() => handleAddReservation()}>Nouvelle réservation</Button>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-wrap justify-between items-center gap-4">
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleDateChange(-1)}>&larr;</button>
                    <span className="font-semibold">{formattedDate}</span>
                    <button onClick={() => handleDateChange(1)}>&rarr;</button>
                </div>
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-md p-1">
                    <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'week' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Semaine</button>
                    <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'month' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Mois</button>
                </div>
            </div>
            
            {isDataLoading ? (
                <div className="text-center py-12">Chargement du calendrier...</div>
            ) : viewMode === 'week' ? (
                <ReservationsCalendarView
                    startDate={currentDate}
                    reservations={reservations}
                    bungalows={bungalows}
                    onSelectReservation={handleSelectReservation}
                    onAddReservation={handleAddReservation}
                />
            ) : (
                <CalendarMonthView
                    date={currentDate}
                    reservations={reservations}
                    onSelectReservation={handleSelectReservation}
                    bungalows={bungalows}
                />
            )}
            
            {isFormModalOpen && (
                <ReservationFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setFormModalOpen(false)}
                    onSave={handleSaveReservation}
                    reservation={selectedReservation}
                    bungalows={bungalows}
                    clients={clients}
                />
            )}

            {isDetailsModalOpen && selectedReservation && selectedBungalow && selectedClient && (
                <ReservationDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    reservation={selectedReservation as Reservation}
                    bungalow={selectedBungalow}
                    client={selectedClient}
                />
            )}
        </div>
    );
};

export default ReservationsPage;