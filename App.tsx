// App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import { NotificationProvider } from './hooks/useNotifications';
import { ToastProvider } from './hooks/useToasts';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './components/pages/DashboardPage';
import BungalowsPage from './components/pages/BungalowsPage';
import ReservationsPage from './components/pages/ReservationsPage';
import ClientsPage from './components/pages/ClientsPage';
import BillingPage from './components/pages/BillingPage';
import LoyaltyPage from './components/pages/LoyaltyPage';
import CommunicationPage from './components/pages/CommunicationPage';
import MaintenancePage from './components/pages/MaintenancePage';
import ReportsPage from './components/pages/ReportsPage';
import UsersPage from './components/pages/UsersPage';
import SettingsPage from './components/pages/SettingsPage';
import ProfilePage from './components/pages/ProfilePage';
import LoginPage from './components/pages/LoginPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import ToastContainer from './components/ui/ToastContainer';

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="w-full h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>;
    }
    
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <AppLayout />;
};

function App() {
  return (
    <Router>
        <AuthProvider>
            <DataProvider>
                <NotificationProvider>
                    <ToastProvider>
                        <ToastContainer />
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route element={<ProtectedRoute />}>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="/bungalows" element={<BungalowsPage />} />
                                <Route path="/reservations" element={<ReservationsPage />} />
                                <Route path="/clients" element={<ClientsPage />} />
                                <Route path="/facturation" element={<BillingPage />} />
                                <Route path="/fidelite" element={<LoyaltyPage />} />
                                <Route path="/communication" element={<CommunicationPage />} />
                                <Route path="/maintenance" element={<MaintenancePage />} />
                                <Route path="/rapports" element={<ReportsPage />} />
                                <Route path="/utilisateurs" element={<UsersPage />} />
                                <Route path="/parametres" element={<SettingsPage />} />
                                <Route path="/profil" element={<ProfilePage />} />
                            </Route>
                             <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </ToastProvider>
                </NotificationProvider>
            </DataProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;
