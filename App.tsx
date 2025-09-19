import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotifications';
import { DataProvider } from './hooks/useData';
import { Permission } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './components/pages/DashboardPage';
import BungalowsPage from './components/pages/BungalowsPage';
import ReservationsPage from './components/pages/ReservationsPage';
import UsersPage from './components/pages/UsersPage';
import SettingsPage from './components/pages/SettingsPage';
import ProfilePage from './components/pages/ProfilePage';
import BillingPage from './components/pages/BillingPage';
import ClientsPage from './components/pages/ClientsPage';
import MaintenancePage from './components/pages/MaintenancePage';
import ReportsPage from './components/pages/ReportsPage';

const navIcons: { [key: string]: any } = {
    'Tableau de bord': 'home',
    'Bungalows': 'home',
    'Réservations': 'calendar',
    'Clients': 'users',
    'Facturation': 'currency',
    'Maintenance': 'wrench',
    'Rapports': 'chart',
    'Utilisateurs': 'users',
    'Paramètres': 'cog',
    'Mon Profil': 'users',
};

const ProtectedRoute: React.FC<{ permission?: Permission | Permission[], children: JSX.Element }> = ({ permission, children }) => {
    const { hasPermission } = useAuth();
    if (permission && !hasPermission(permission)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const AppLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/bungalows" element={
                            <ProtectedRoute permission="bungalows:read">
                                <BungalowsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/reservations" element={
                            <ProtectedRoute permission="reservations:read">
                                <ReservationsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/clients" element={
                            <ProtectedRoute permission="clients:read">
                                <ClientsPage />
                             </ProtectedRoute>
                        } />
                        <Route path="/facturation" element={
                            <ProtectedRoute permission="billing:read">
                                <BillingPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/maintenance" element={
                            <ProtectedRoute permission="maintenance:read">
                                <MaintenancePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/rapports" element={
                             <ProtectedRoute permission="reports:read">
                                <ReportsPage />
                             </ProtectedRoute>
                        } />
                        <Route path="/utilisateurs" element={
                            <ProtectedRoute permission="users:read">
                                <UsersPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/parametres" element={
                            <ProtectedRoute permission="settings:read">
                                <SettingsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/profil" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <DataProvider>
                    <Router>
                        <AppLayout />
                    </Router>
                </DataProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;
