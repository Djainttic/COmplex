// lib/mockData.ts
import {
  User, Settings, Bungalow, Reservation, Client, MaintenanceRequest, Invoice, CommunicationLog, LoyaltyLog,
  UserRole, UserStatus, BungalowStatus, BungalowType, ReservationStatus, MaintenanceStatus, MaintenancePriority, InvoiceStatus,
  Currency, PricingAdjustmentType, LoyaltyLogType, Permission, RoleSetting
} from '../types';

const ALL_PERMISSIONS: Permission[] = [
  'bungalows:read', 'bungalows:create', 'bungalows:update', 'bungalows:delete', 'bungalows:update_status',
  'reservations:read', 'reservations:write',
  'clients:read', 'clients:write',
  'billing:read', 'billing:write',
  'loyalty:read', 'loyalty:write',
  'communication:read', 'communication:write',
  'maintenance:read', 'maintenance:write',
  'reports:read', 'reports:write',
  'users:read', 'users:write',
  'settings:read', 'settings:write'
];

const ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(p => !p.startsWith('users:') && !p.startsWith('settings:'));
const MANAGER_PERMISSIONS: Permission[] = [
    'bungalows:read', 'bungalows:update_status', 'reservations:read', 'reservations:write', 'clients:read', 'clients:write', 'billing:read',
    'loyalty:read', 'communication:read', 'maintenance:read', 'maintenance:write', 'reports:read'
];
const EMPLOYEE_PERMISSIONS: Permission[] = [
    'bungalows:read', 'bungalows:update_status', 'reservations:read', 'clients:read', 'maintenance:read'
];

const createPermissionsMap = (allowed: Permission[]): { [key in Permission]?: boolean } => {
    const map: { [key in Permission]?: boolean } = {};
    for (const p of ALL_PERMISSIONS) {
        map[p] = allowed.includes(p);
    }
    return map;
};

const MOCK_ROLES: RoleSetting[] = [
    { roleName: UserRole.SuperAdmin, permissions: createPermissionsMap(ALL_PERMISSIONS) },
    { roleName: UserRole.Admin, permissions: createPermissionsMap(ADMIN_PERMISSIONS) },
    { roleName: UserRole.Manager, permissions: createPermissionsMap(MANAGER_PERMISSIONS) },
    { roleName: UserRole.Employee, permissions: createPermissionsMap(EMPLOYEE_PERMISSIONS) },
];


export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Alice SuperAdmin', email: 'super@syphax.app', phone: '0123456789', role: UserRole.SuperAdmin, status: UserStatus.Active, avatarUrl: 'https://i.ibb.co/C5F5bJ4/alice.jpg', lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), isOnline: true, permissions: ALL_PERMISSIONS },
    { id: 'user-2', name: 'Bob Admin', email: 'admin@syphax.app', phone: '0234567890', role: UserRole.Admin, status: UserStatus.Active, avatarUrl: 'https://i.ibb.co/Gcv2w2C/bob.jpg', lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isOnline: true, permissions: ADMIN_PERMISSIONS },
    { id: 'user-3', name: 'Charlie Manager', email: 'manager@syphax.app', phone: '0345678901', role: UserRole.Manager, status: UserStatus.Active, avatarUrl: 'https://i.ibb.co/hKCMq8Y/charlie.jpg', lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isOnline: false, permissions: MANAGER_PERMISSIONS },
    { id: 'user-4', name: 'Diana Employee', email: 'employee@syphax.app', phone: '0456789012', role: UserRole.Employee, status: UserStatus.Active, avatarUrl: 'https://i.ibb.co/S6w2m2B/diana.jpg', lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isOnline: true, permissions: EMPLOYEE_PERMISSIONS },
    { id: 'user-5', name: 'Eve Inactive', email: 'eve@syphax.app', phone: '0567890123', role: UserRole.Employee, status: UserStatus.Inactive, avatarUrl: 'https://i.ibb.co/Y0p5q0f/eve.jpg', lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), isOnline: false, permissions: EMPLOYEE_PERMISSIONS },
];

export const MOCK_SETTINGS: Settings = {
    general: { complexName: 'Syphax B-Resort', logoUrl: 'https://i.ibb.co/2d9y22T/syphax-logo.png', bungalowCount: 10, loginImageUrl: 'https://i.ibb.co/3W81zgx/syphax-bg.jpg', galleryImageUrls: ['https://i.ibb.co/q0zM0gM/gallery1.jpg', 'https://i.ibb.co/pzp5z5T/gallery2.jpg'] },
    financial: {
        currency: Currency.DZD, fiscalInfo: { RC: 'RC/12345/2024', NIF: 'NIF/54321/2024' },
        pricingRules: [
            { id: 'rule-1', name: 'Week-end Haut Tarif', adjustmentType: PricingAdjustmentType.PercentageIncrease, value: 20, daysOfWeek: [4, 5], bungalowTypeIds: [], },
            { id: 'rule-2', name: 'Promotion Été', adjustmentType: PricingAdjustmentType.PercentageDiscount, value: 15, bungalowTypeIds: [], startDate: '2024-07-01', endDate: '2024-08-31' },
        ]
    },
    security: { passwordPolicy: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: false }, twoFactorAuth: { enforced: false } },
    bungalows: {
        types: [
            { id: 'type-1', name: BungalowType.Standard, capacity: 2, defaultPrice: 10000, amenities: ['Wi-Fi', 'TV'], description: 'Simple et confortable.' },
            { id: 'type-2', name: BungalowType.Luxe, capacity: 2, defaultPrice: 20000, amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Vue sur mer'], description: 'Luxe et vue imprenable.' },
            { id: 'type-3', name: BungalowType.Familial, capacity: 4, defaultPrice: 18000, amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Cuisine'], description: 'Idéal pour les familles.' },
        ],
        allAmenities: [{ id: 'amen-1', name: 'Wi-Fi' }, { id: 'amen-2', name: 'TV' }, { id: 'amen-3', name: 'Climatisation' }, { id: 'amen-4', name: 'Vue sur mer' }, { id: 'amen-5', name: 'Cuisine' }],
        automation: { enableAutoCleaning: true }
    },
    roles: MOCK_ROLES,
    moduleStatus: { 'bungalows': true, 'reservations': true, 'clients': true, 'facturation': true, 'fidelite': true, 'communication': true, 'maintenance': true, 'rapports': true, 'utilisateurs': true, 'ai': true },
    loyalty: { enabled: true, pointsPerNight: 10, pointsForFirstReservation: 50, pointsToCurrencyValue: 10 },
    license: { key: 'SYPHX-PRO-XXXX-YYYY-ZZZZ', status: 'Active', expiresOn: '2025-12-31T23:59:59Z' }
};

export const MOCK_BUNGALOWS: Bungalow[] = [
    { id: 'bungalow-1', name: 'Le Palmier', type: BungalowType.Standard, status: BungalowStatus.Available, capacity: 2, pricePerNight: 10000, amenities: ['Wi-Fi', 'TV'], imageUrl: 'https://i.ibb.co/q0zM0gM/gallery1.jpg', description: 'Un bungalow standard avec vue sur le jardin.' },
    { id: 'bungalow-2', name: 'La Vague', type: BungalowType.Luxe, status: BungalowStatus.Occupied, capacity: 2, pricePerNight: 20000, amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Vue sur mer'], imageUrl: 'https://i.ibb.co/pzp5z5T/gallery2.jpg', description: 'Le luxe absolu face à la mer.' },
    { id: 'bungalow-3', name: 'Le Familial', type: BungalowType.Familial, status: BungalowStatus.Cleaning, capacity: 4, pricePerNight: 18000, amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Cuisine'], imageUrl: 'https://i.ibb.co/M5BXMTH/gallery3.jpg', description: 'Spacieux et équipé pour toute la famille.' },
    { id: 'bungalow-4', name: 'Le Pin', type: BungalowType.Standard, status: BungalowStatus.Maintenance, capacity: 2, pricePerNight: 10000, amenities: ['Wi-Fi', 'TV'], imageUrl: 'https://i.ibb.co/Jk1N9zK/gallery4.jpg', description: 'Au coeur de la pinède, calme assuré.' },
];

export const MOCK_CLIENTS: Client[] = [
    { id: 'client-1', name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '0612345678', address: '1 rue de la Paix, Paris', registrationDate: '2024-01-15T10:00:00Z', loyaltyPoints: 120 },
    { id: 'client-2', name: 'Marie Curie', email: 'marie.curie@email.com', phone: '0687654321', address: '2 avenue des Sciences, Lyon', registrationDate: '2024-03-20T14:30:00Z', loyaltyPoints: 250 },
    { id: 'client-3', name: 'Albert Camus', email: 'albert.camus@email.com', phone: '0700112233', address: '3 boulevard du Soleil, Alger', registrationDate: '2024-05-10T09:00:00Z', loyaltyPoints: 80 },
];

export const MOCK_RESERVATIONS: Reservation[] = [
    { id: 'res-1', bungalowId: 'bungalow-2', clientId: 'client-1', startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Confirmed, totalPrice: 80000 },
    { id: 'res-2', bungalowId: 'bungalow-3', clientId: 'client-2', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Pending, totalPrice: 54000 },
    { id: 'res-3', bungalowId: 'bungalow-1', clientId: 'client-3', startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Confirmed, totalPrice: 30000 },
    { id: 'res-4', bungalowId: 'bungalow-4', clientId: 'client-3', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: ReservationStatus.Confirmed, totalPrice: 10000 },
];

export const MOCK_INVOICES: Invoice[] = [
    { id: 'INV-2024-001', reservationId: 'res-3', clientId: 'client-3', issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 30000, status: InvoiceStatus.Paid, items: [{ description: 'Séjour Le Pin - 3 nuits', quantity: 3, unitPrice: 10000, total: 30000 }] },
    { id: 'INV-2024-002', reservationId: 'res-1', clientId: 'client-1', issueDate: new Date().toISOString(), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 80000, status: InvoiceStatus.Unpaid, items: [{ description: 'Séjour La Vague - 4 nuits', quantity: 4, unitPrice: 20000, total: 80000 }] },
    { id: 'INV-2024-003', reservationId: 'res-2', clientId: 'client-2', issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), totalAmount: 54000, status: InvoiceStatus.Overdue, items: [{ description: 'Séjour Le Familial - 3 nuits', quantity: 3, unitPrice: 18000, total: 54000 }] },
];

export const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
    { id: 'maint-1', bungalowId: 'bungalow-4', description: 'Fuite au robinet de la cuisine', status: MaintenanceStatus.InProgress, priority: MaintenancePriority.High, createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), reportedBy: 'Diana Employee', assignedToId: 'user-4' },
    { id: 'maint-2', bungalowId: 'bungalow-1', description: 'Ampoule grillée dans la chambre', status: MaintenanceStatus.Resolved, priority: MaintenancePriority.Low, createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), reportedBy: 'Diana Employee', assignedToId: 'user-4', resolvedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), resolutionDetails: 'Ampoule changée.' },
    { id: 'maint-3', bungalowId: 'bungalow-2', description: 'Climatisation ne refroidit plus', status: MaintenanceStatus.Pending, priority: MaintenancePriority.Medium, createdDate: new Date().toISOString(), reportedBy: 'Charlie Manager' },
];

export const MOCK_COMMUNICATION_LOGS: CommunicationLog[] = [
    { id: 'comm-1', recipients: ['client-1', 'client-2'], subject: 'Promotion spéciale Printemps', body: 'Profitez de -15% sur votre prochain séjour...', sentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Envoyé', sentBy: 'user-3' }
];

export const MOCK_LOYALTY_LOGS: LoyaltyLog[] = [
    { id: 'loylog-1', clientId: 'client-1', type: LoyaltyLogType.Earned, pointsChange: 30, reason: 'Séjour du 10/05 au 13/05', timestamp: new Date().toISOString(), relatedId: 'res-3' },
    { id: 'loylog-2', clientId: 'client-2', type: LoyaltyLogType.InitialBonus, pointsChange: 50, reason: 'Première réservation', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), relatedId: 'res-2' },
    { id: 'loylog-3', clientId: 'client-1', type: LoyaltyLogType.ManualAdjustment, pointsChange: -10, reason: 'Correction erreur', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), adminUserId: 'user-2' }
];
