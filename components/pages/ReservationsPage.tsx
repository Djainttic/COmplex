import React, { useState, useMemo } from 'react';
import { Reservation, Bungalow, Client, ReservationStatus } from '../../types';
import { formatDateDDMMYYYY } from '../../constants';
import Button from '../ui/Button';
import CalendarMonthView from '../reservations/CalendarMonthView';
import ReservationDetailsModal from '../reservations/ReservationDetailsModal';
import ReservationsCalendarView from '../reservations/ReservationsCalendarView';
import ReservationFormModal from '../reservations/ReservationFormModal';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

const ReservationsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const { reservations, addReservation, updateReservation, bungalows, clients } = useData();
    const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // State for modals
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    
    // State for creating/editing reservations
    const [editingReservation, setEditingReservation] = useState<Partial<Reservation> | null>(null);

    const handleSelectReservation = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setDetailsModalOpen(true);
    };

    const handleAddReservation = (bungalowId: string, startDate: Date) => {
        setEditingReservation({ bungalowId, startDate: startDate.toISOString() });
        setFormModalOpen(true);
    };

    const handleSaveReservation = (reservationToSave: Reservation) => {
        if (reservationToSave.id) {
            // Editing existing reservation
            updateReservation(reservationToSave);
        } else {
            // Adding new reservation
            const newReservation = {
                ...reservationToSave,
                id: `res-${Date.now()}`
            };
            addReservation(newReservation);
        }
        setFormModalOpen(false);
        setEditingReservation(null);
    };


    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        const newDate = new Date(currentDate);
        if (direction === 'today') {
            setCurrentDate(new Date());
            return;
        }

        if (viewMode === 'month') {
            const monthOffset = direction === 'prev' ? -1 : 1;
            newDate.setMonth(newDate.getMonth() + monthOffset);
        } else { // week view
            const dayOffset = direction === 'prev' ? -7 : 7;
            newDate.setDate(newDate.getDate() + dayOffset);
        }
        setCurrentDate(newDate);
    };

    const headerDateText = useMemo(() => {
        if (viewMode === 'month') {
            return currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        }
        
        // Week view starts on Sunday
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return `${formatDateDDMMYYYY(weekStart)} - ${formatDateDDMMYYYY(weekEnd)}`;
    }, [currentDate, viewMode]);

    const selectedBungalow = bungalows.find(b => b.id === selectedReservation?.bungalowId);
    const selectedClient = clients.find(c => c.id === selectedReservation?.clientId);

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planning des Réservations</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Visualisez et gérez les réservations sur le calendrier.
                    </p>
                </div>
                 {hasPermission('reservations:write') && (
                     <Button onClick={() => handleAddReservation('', new Date())}>
                        Ajouter une réservation
                    </Button>
                )}
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-wrap items-center justify-between mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow gap-4">
                 <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
                        {headerDateText}
                    </h2>
                    <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center">
                        <Button size="sm" variant={viewMode === 'week' ? 'primary' : 'secondary'} onClick={() => setViewMode('week')}>Semaine</Button>
                        <Button size="sm" variant={viewMode === 'month' ? 'primary' : 'secondary'} onClick={() => setViewMode('month')}>Mois</Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={() => handleNavigate('prev')}>&lt; Préc.</Button>
                    <Button variant="secondary" onClick={() => handleNavigate('today')}>Aujourd'hui</Button>
                    <Button variant="secondary" onClick={() => handleNavigate('next')}>Suiv. &gt;</Button>
                </div>
            </div>

            {viewMode === 'month' ? (
                 <CalendarMonthView 
                    date={currentDate} 
                    reservations={reservations} 
                    onSelectReservation={handleSelectReservation} 
                />
            ) : (
                <ReservationsCalendarView
                    startDate={currentDate}
                    reservations={reservations}
                    bungalows={bungalows}
                    onSelectReservation={handleSelectReservation}
                    onAddReservation={handleAddReservation}
                />
            )}

            {isDetailsModalOpen && selectedReservation && selectedBungalow && selectedClient && (
                <ReservationDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    reservation={selectedReservation}
                    bungalow={selectedBungalow}
                    client={selectedClient}
                />
            )}

            {isFormModalOpen && (
                <ReservationFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => { setFormModalOpen(false); setEditingReservation(null); }}
                    onSave={handleSaveReservation}
                    reservation={editingReservation}
                    bungalows={bungalows}
                    clients={clients}
                />
            )}
        </div>
    );
};

export default ReservationsPage;
