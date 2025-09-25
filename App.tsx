import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotifications';
import { DataProvider } from './hooks/useData';
import { Permission, UserRole } from './types';
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
import CommunicationPage from './components/pages/CommunicationPage';
import LoginPage from './components/pages/LoginPage';
import LoyaltyPage from './components/pages/LoyaltyPage';
import { NAV_ITEMS } from './constants';
import ResetPasswordPage from './components/pages/ResetPasswordPage';

// FIX: Changed children type from JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const ProtectedRoute: React.FC<{ permission?: Permission | Permission[], children: React.ReactElement }> = ({ permission, children }) => {
    const { hasPermission, settings, currentUser } = useAuth();
    const location = useLocation();

    // Find the module key from NAV_ITEMS based on the current path
    const navItem = NAV_ITEMS.find(item => item.path === location.pathname);
    const moduleKey = navItem?.path.replace('/', '') || 'dashboard';
    
    // Default to true if not defined
    const isModuleActive = settings.moduleStatus[moduleKey] ?? true;

    // SuperAdmin can see all modules regardless of active status
    if (currentUser?.role === UserRole.SuperAdmin) {
        return children;
    }

    if (!isModuleActive || (permission && !hasPermission(permission))) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const ProtectedLayout = () => {
    const { currentUser } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet /> {/* Child routes will be rendered here */}
                </main>
            </div>
        </div>
    );
};

const AppRoutes = () => {
    const { isPasswordRecovery } = useAuth();

    if (isPasswordRecovery) {
        return <ResetPasswordPage />;
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
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
                 <Route path="/fidelite" element={
                    <ProtectedRoute permission="loyalty:read">
                        <LoyaltyPage />
                    </ProtectedRoute>
                } />
                <Route path="/communication" element={
                    <ProtectedRoute permission="communication:read">
                        <CommunicationPage />
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
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <DataProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </DataProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;
