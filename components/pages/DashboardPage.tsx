import React, { useState, useMemo, useEffect } from 'react';
import { Reservation, Client, MaintenanceRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import StatCard from '../ui/StatCard';
import BungalowStatusChart from '../dashboard/BungalowStatusChart';
import UpcomingActivities from '../dashboard/UpcomingActivities';
import QuickActions from '../dashboard/QuickActions';
import RecentActivityFeed from '../dashboard/RecentActivityFeed';

import ReservationFormModal from '../reservations/ReservationFormModal';
import ClientFormModal from '../clients/ClientFormModal';
import MaintenanceFormModal from '../maintenance/MaintenanceFormModal';
import { getVisibleUsers } from '../../constants';

const PageLoader: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center p-10">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
    </div>
);


const DashboardPage: React.FC = () => {
    const { currentUser, allUsers, fetchUsers, loadingUsers } = useAuth();
    const { 
        bungalows, clients, // Full data is now pre-fetched by DataProvider
        dashboardStats, dashboardBungalows, dashboardReservations, dashboardMaintenanceRequests,
        fetchDashboardData,
        addReservation, updateReservation, addClient, updateClient,
        addMaintenanceRequest, updateMaintenanceRequest, isLoading: isDataLoading
    } = useData();

    useEffect(() => {
        // Fetch optimized data for dashboard display
        fetchDashboardData();
        // Users are managed by AuthContext, so we fetch them here
        fetchUsers();
    }, [fetchDashboardData, fetchUsers]);

    const [isReservationModalOpen, setReservationModalOpen] = useState(false);
    const [isClientModalOpen, setClientModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

    const assignableUsers = getVisibleUsers(currentUser, allUsers);

    const handleSaveReservation = async (res: Reservation) => {
        if (res.id && res.id !== '') {
            await updateReservation(res);
        } else {
            const { id, ...newRes } = res;
            await addReservation(newRes);
        }
        setReservationModalOpen(false);
        fetchDashboardData(); // Refresh dashboard data
    };

     const handleSaveClient = async (cli: Client) => {
        if (cli.id && cli.id !== '') {
            await updateClient(cli);
        } else {
            const { id, ...newCli } = cli;
            await addClient(newCli);
        }
        setClientModalOpen(false);
    };

    const handleSaveMaintenance = async (req: MaintenanceRequest) => {
        if (req.id && req.id !== '') {
            await updateMaintenanceRequest(req);
        } else {
            const { id, ...newReq } = req;
            await addMaintenanceRequest(newReq);
        }
        setMaintenanceModalOpen(false);
        fetchDashboardData(); // Refresh dashboard data
    };

    const isLoading = isDataLoading.dashboard || loadingUsers;

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard 
                    title="Arrivées aujourd'hui"
                    value={dashboardStats.checkInsToday.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
                />
                 <StatCard 
                    title="Départs aujourd'hui"
                    value={dashboardStats.checkOutsToday.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
                />
                 <StatCard 
                    title="Taux d'occupation"
                    value={`${dashboardStats.occupancyRate.toFixed(1)}%`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <StatCard 
                    title="Maintenance en cours"
                    value={dashboardStats.pendingMaintenance.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <BungalowStatusChart bungalows={dashboardBungalows} />
                </div>
                <div>
                    <UpcomingActivities reservations={dashboardReservations} clients={clients} bungalows={bungalows} />
                </div>
                <div className="lg:col-span-2">
                    <RecentActivityFeed 
                        reservations={dashboardReservations}
                        maintenanceRequests={dashboardMaintenanceRequests}
                        clients={clients}
                        bungalows={bungalows}
                    />
                </div>
                <div>
                    <QuickActions 
                        onAddReservation={() => setReservationModalOpen(true)}
                        onAddClient={() => setClientModalOpen(true)}
                        onAddMaintenance={() => setMaintenanceModalOpen(true)}
                    />
                </div>
            </div>

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
                    users={assignableUsers}
                />
            )}
        </>
    );
};

export default DashboardPage;