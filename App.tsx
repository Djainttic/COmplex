import React, { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NotificationProvider } from './hooks/useNotifications';
import { DataProvider } from './hooks/useData';
import { Permission, UserRole } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './components/pages/LoginPage';
import { NAV_ITEMS } from './constants';
import ResetPasswordPage from './components/pages/ResetPasswordPage';

// Lazy-loaded page components for code splitting
const DashboardPage = lazy(() => import('./components/pages/DashboardPage'));
const BungalowsPage = lazy(() => import('./components/pages/BungalowsPage'));
const ReservationsPage = lazy(() => import('./components/pages/ReservationsPage'));
const UsersPage = lazy(() => import('./components/pages/UsersPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const BillingPage = lazy(() => import('./components/pages/BillingPage'));
const ClientsPage = lazy(() => import('./components/pages/ClientsPage'));
const MaintenancePage = lazy(() => import('./components/pages/MaintenancePage'));
const ReportsPage = lazy(() => import('./components/pages/ReportsPage'));
const CommunicationPage = lazy(() => import('./components/pages/CommunicationPage'));
const LoyaltyPage = lazy(() => import('./components/pages/LoyaltyPage'));


const PageLoader: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
  </div>
);

const ProtectedRoute: React.FC<{ permission?: Permission | Permission[], children: React.ReactElement }> = ({ permission, children }) => {
    const { hasPermission, settings, currentUser } = useAuth();
    const location = useLocation();

    const navItem = NAV_ITEMS.find(item => item.path === location.pathname);
    const moduleKey = navItem?.path.replace('/', '') || 'dashboard';
    
    const isModuleActive = settings.moduleStatus[moduleKey] ?? true;

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
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
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
                        <Suspense fallback={<PageLoader />}>
                            <AppRoutes />
                        </Suspense>
                    </Router>
                </DataProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;
