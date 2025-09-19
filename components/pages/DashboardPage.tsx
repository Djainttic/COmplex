import React, { useState, useMemo } from 'react';
import { BungalowStatus, MaintenanceStatus, Reservation, Client, MaintenanceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import StatCard from '../ui/StatCard';
import BungalowStatusChart from '../dashboard/BungalowStatusChart';
import UpcomingActivities from '../dashboard/UpcomingActivities';
import QuickActions from '../dashboard/QuickActions';
import RecentActivityFeed from '../dashboard/RecentActivityFeed';

// Modals for Quick Actions
import ReservationFormModal from '../reservations/ReservationFormModal';
import ClientFormModal from '../clients/ClientFormModal';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';

const DashboardPage: React.FC = () => {
    // FIX: `allUsers` is provided by `useAuth`, not `useData`. Destructured accordingly.
    const { currentUser, allUsers } = useAuth();
    const { 
        bungalows, reservations, clients, maintenanceRequests,
        addReservation, updateReservation,
        addClient, updateClient,
        addMaintenanceRequest, updateMaintenanceRequest
    } = useData();

    // State for Quick Action Modals
    const [isReservationModalOpen, setReservationModalOpen] = useState(false);
    const [isClientModalOpen, setClientModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

    const isToday = (someDate: Date) => {
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    };

    const dashboardData = useMemo(() => {
        const checkInsToday = reservations.filter(r => isToday(new Date(r.startDate))).length;
        const checkOutsToday = reservations.filter(r => isToday(new Date(r.endDate))).length;
        
        const occupiedCount = bungalows.filter(b => b.status === BungalowStatus.Occupied).length;
        const totalBungalows = bungalows.length;
        const occupancyRate = totalBungalows > 0 ? (occupiedCount / totalBungalows) * 100 : 0;

        const pendingMaintenance = maintenanceRequests.filter(
            r => r.status === MaintenanceStatus.Pending || r.status === MaintenanceStatus.InProgress
        ).length;
        
        return { checkInsToday, checkOutsToday, occupancyRate, pendingMaintenance };
    }, [reservations, bungalows, maintenanceRequests]);

    // Handlers for Quick Actions
    const handleSaveReservation = (res: Reservation) => {
        if (res.id) updateReservation(res);
        else addReservation({ ...res, id: `res-${Date.now()}` });
        setReservationModalOpen(false);
    };
    
    const handleSaveClient = (client: Client) => {
        if (client.id) updateClient(client);
        else addClient({ ...client, id: `client-${Date.now()}`, registrationDate: new Date().toISOString(), loyaltyPoints: 0 });
        setClientModalOpen(false);
    };

    const handleSaveMaintenance = (req: MaintenanceRequest) => {
        if (req.id) updateMaintenanceRequest(req);
        else addMaintenanceRequest({ ...req, id: `maint-${Date.now()}`, createdDate: new Date().toISOString() });
        setMaintenanceModalOpen(false);
    };

    const icons = {
        checkin: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>,
        checkout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>,
        occupancy: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        maintenance: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Bonjour {currentUser?.name}, voici un aperçu de l'activité de votre complexe.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <StatCard title="Taux d'occupation" value={`${dashboardData.occupancyRate.toFixed(1)}%`} icon={icons.occupancy} />
                <StatCard title="Arrivées aujourd'hui" value={`${dashboardData.checkInsToday}`} icon={icons.checkin} />
                <StatCard title="Départs aujourd'hui" value={`${dashboardData.checkOutsToday}`} icon={icons.checkout} />
                <StatCard title="Maintenance en cours" value={`${dashboardData.pendingMaintenance}`} icon={icons.maintenance} />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <BungalowStatusChart bungalows={bungalows} />
                   <RecentActivityFeed 
                       reservations={reservations} 
                       maintenanceRequests={maintenanceRequests}
                       clients={clients}
                       bungalows={bungalows}
                   />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <QuickActions 
                        onAddReservation={() => setReservationModalOpen(true)}
                        onAddClient={() => setClientModalOpen(true)}
                        onAddMaintenance={() => setMaintenanceModalOpen(true)}
                    />
                    <UpcomingActivities
                        reservations={reservations}
                        clients={clients}
                        bungalows={bungalows}
                    />
                </div>
            </div>

            {/* Modals */}
            {isReservationModalOpen && (
                <ReservationFormModal 
                    isOpen={isReservationModalOpen}
                    onClose={() => setReservationModalOpen(false)}
                    onSave={handleSaveReservation}
                    reservation={null}
                    bungalows={bungalows}
                    clients={clients}
                />
            )}
             {isClientModalOpen && (
                <ClientFormModal
                    isOpen={isClientModalOpen}
                    onClose={() => setClientModalOpen(false)}
                    onSave={handleSaveClient}
                    client={null}
                />
            )}
            {isMaintenanceModalOpen && (
                <MaintenanceFormModal
                    isOpen={isMaintenanceModalOpen}
                    onClose={() => setMaintenanceModalOpen(false)}
                    onSave={handleSaveMaintenance}
                    request={null}
                    bungalows={bungalows}
                    users={allUsers}
                />
            )}
        </div>
    );
};

export default DashboardPage;