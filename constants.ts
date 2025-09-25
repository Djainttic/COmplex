// constants.ts
import { Bungalow, Client, Reservation, Invoice, MaintenanceRequest, UserRole, UserStatus, BungalowStatus, BungalowType, ReservationStatus, InvoiceStatus, MaintenanceStatus, MaintenancePriority, LoyaltyLog, LoyaltyLogType, User, Permission } from './types';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission?: Permission | Permission[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Tableau de bord', icon: 'home' },
  { path: '/bungalows', label: 'Bungalows', icon: 'home', permission: 'bungalows:read' },
  { path: '/reservations', label: 'Réservations', icon: 'calendar', permission: 'reservations:read' },
  { path: '/clients', label: 'Clients', icon: 'users', permission: 'clients:read' },
  { path: '/facturation', label: 'Facturation', icon: 'currency', permission: 'billing:read' },
  { path: '/fidelite', label: 'Fidélité', icon: 'star', permission: 'loyalty:read' },
  { path: '/communication', label: 'Communication', icon: 'communication', permission: 'communication:read' },
  { path: '/maintenance', label: 'Maintenance', icon: 'wrench', permission: 'maintenance:read' },
  { path: '/rapports', label: 'Rapports', icon: 'chart', permission: 'reports:read' },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: 'users', permission: 'users:read' },
  { path: '/parametres', label: 'Paramètres', icon: 'cog', permission: 'settings:read' },
  // Profil is accessible by everyone
];


// MOCK DATA
export const MOCK_BUNGALOWS: Bungalow[] = [
  { id: 'bungalow-1', name: 'Le Palmier', type: BungalowType.Luxe, status: BungalowStatus.Occupied, capacity: 2, pricePerNight: 15000, amenities: ['Wi-Fi', 'Climatisation', 'Vue sur mer'], imageUrl: 'https://picsum.photos/seed/bungalow1/400/300', description: 'Un bungalow de luxe avec une vue imprenable.' },
  { id: 'bungalow-2', name: 'La Pinède', type: BungalowType.Familial, status: BungalowStatus.Available, capacity: 4, pricePerNight: 18000, amenities: ['Wi-Fi', 'Climatisation', 'Cuisine équipée'], imageUrl: 'https://picsum.photos/seed/bungalow2/400/300', description: 'Idéal pour les familles, spacieux et confortable.' },
  { id: 'bungalow-3', name: 'Le Cocon', type: BungalowType.Standard, status: BungalowStatus.Cleaning, capacity: 2, pricePerNight: 10000, amenities: ['Wi-Fi', 'Ventilateur'], imageUrl: 'https://picsum.photos/seed/bungalow3/400/300', description: 'Simple et cosy, parfait pour un couple.' },
  { id: 'bungalow-4', name: 'Le Récif', type: BungalowType.Suite, status: BungalowStatus.Maintenance, capacity: 2, pricePerNight: 25000, amenities: ['Wi-Fi', 'Climatisation', 'Jacuzzi', 'Vue sur mer'], imageUrl: 'https://picsum.photos/seed/bungalow4/400/300', description: 'Notre meilleure suite pour une expérience inoubliable.' },
  { id: 'bungalow-5', name: 'La Vague', type: BungalowType.Standard, status: BungalowStatus.Available, capacity: 2, pricePerNight: 11000, amenities: ['Wi-Fi', 'Climatisation'], imageUrl: 'https://picsum.photos/seed/bungalow5/400/300', description: 'Proche de la plage, avec le son des vagues.' },
  { id: 'bungalow-6', name: 'Le Familial XL', type: BungalowType.Familial, status: BungalowStatus.Available, capacity: 6, pricePerNight: 22000, amenities: ['Wi-Fi', 'Climatisation', 'Cuisine équipée', '2 Chambres'], imageUrl: 'https://picsum.photos/seed/bungalow6/400/300', description: 'Pour les grandes familles ou les groupes d\'amis.' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'client-1', name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '0612345678', address: '1 rue de la Paix, Paris', registrationDate: '2023-01-15T10:00:00Z', loyaltyPoints: 150 },
  { id: 'client-2', name: 'Marie Curie', email: 'marie.curie@email.com', phone: '0687654321', address: '2 avenue des Sciences, Lyon', registrationDate: '2023-03-20T14:30:00Z', loyaltyPoints: 320 },
  { id: 'client-3', name: 'Albert Camus', email: 'albert.camus@email.com', phone: '0700112233', registrationDate: '2023-05-10T11:00:00Z', loyaltyPoints: 50 },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'res-1', bungalowId: 'bungalow-1', clientId: 'client-1', startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Confirmed, totalPrice: 75000 },
  { id: 'res-2', bungalowId: 'bungalow-3', clientId: 'client-2', startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Pending, totalPrice: 30000 },
  { id: 'res-3', bungalowId: 'bungalow-2', clientId: 'client-3', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Confirmed, totalPrice: 90000 },
  { id: 'res-4', bungalowId: 'bungalow-2', clientId: 'client-1', startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Confirmed, totalPrice: 90000 },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2024-001', reservationId: 'res-4', clientId: 'client-1', issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 90000, status: InvoiceStatus.Paid, items: [{ description: 'Séjour 5 nuits', quantity: 5, unitPrice: 18000, total: 90000 }] },
  { id: 'INV-2024-002', reservationId: 'res-1', clientId: 'client-1', issueDate: new Date().toISOString(), dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 75000, status: InvoiceStatus.Unpaid, items: [{ description: 'Séjour 5 nuits', quantity: 5, unitPrice: 15000, total: 75000 }] },
  { id: 'INV-2024-003', reservationId: 'res-2', clientId: 'client-2', issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 30000, status: InvoiceStatus.Overdue, items: [{ description: 'Séjour 3 nuits', quantity: 3, unitPrice: 10000, total: 30000 }] },
];

export const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  { id: 'maint-1', bungalowId: 'bungalow-4', description: 'Jacuzzi ne chauffe pas.', status: MaintenanceStatus.InProgress, priority: MaintenancePriority.High, createdDate: '2023-06-01T09:00:00Z', reportedBy: 'Client', assignedToId: 'user-employee' },
  { id: 'maint-2', bungalowId: 'bungalow-5', description: 'Climatiseur fait du bruit.', status: MaintenanceStatus.Pending, priority: MaintenancePriority.Medium, createdDate: '2023-06-02T14:00:00Z', reportedBy: 'Personnel de nettoyage', assignedToId: 'user-employee' },
  { id: 'maint-3', bungalowId: 'bungalow-2', description: 'Ampoule grillée dans la salle de bain.', status: MaintenanceStatus.Resolved, priority: MaintenancePriority.Low, createdDate: '2023-05-28T18:00:00Z', reportedBy: 'Client', assignedToId: 'user-employee', resolvedDate: '2023-05-29T10:00:00Z', resolutionDetails: 'Ampoule remplacée.' },
];

export const MOCK_LOYALTY_LOGS: LoyaltyLog[] = [
    { id: 'log-1', clientId: 'client-1', type: LoyaltyLogType.Earned, pointsChange: 100, reason: 'Séjour de 5 nuits', timestamp: '2023-01-20T12:00:00Z', relatedId: 'res-4' },
    { id: 'log-2', clientId: 'client-1', type: LoyaltyLogType.InitialBonus, pointsChange: 50, reason: 'Bonus de première réservation', timestamp: '2023-01-20T12:00:00Z', relatedId: 'res-4' },
    { id: 'log-3', clientId: 'client-2', type: LoyaltyLogType.ManualAdjustment, pointsChange: 20, reason: 'Geste commercial', timestamp: '2023-04-01T10:00:00Z', adminUserId: 'user-admin' },
];


// HELPER FUNCTIONS
export const formatDateDDMMYYYY = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTimeDDMMYYYY = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `il y a ${Math.floor(interval)} an(s)`;
    interval = seconds / 2592000;
    if (interval > 1) return `il y a ${Math.floor(interval)} mois`;
    interval = seconds / 86400;
    if (interval > 1) return `il y a ${Math.floor(interval)} jour(s)`;
    interval = seconds / 3600;
    if (interval > 1) return `il y a ${Math.floor(interval)} heure(s)`;
    interval = seconds / 60;
    if (interval > 1) return `il y a ${Math.floor(interval)} minute(s)`;
    return "à l'instant";
};


/**
 * Determines which users an authenticated user can see or assign tasks to.
 * - SuperAdmin sees everyone.
 * - Admin sees everyone except SuperAdmins.
 * - Manager sees their own employees and themselves.
 * - Employee sees only themselves.
 * @param currentUser The currently logged-in user.
 * @param allUsers The complete list of users.
 * @returns A filtered array of visible users.
 */
export const getVisibleUsers = (currentUser: User | null, allUsers: User[]): User[] => {
    if (!currentUser) return [];

    switch (currentUser.role) {
        case UserRole.SuperAdmin:
            return allUsers;
        case UserRole.Admin:
            return allUsers.filter(user => user.role !== UserRole.SuperAdmin);
        case UserRole.Manager:
            // Example: A manager can see other managers and all employees.
            return allUsers.filter(user => user.role === UserRole.Manager || user.role === UserRole.Employee);
        case UserRole.Employee:
            return allUsers.filter(user => user.id === currentUser.id);
        default:
            return [];
    }
};
