import { Bungalow, BungalowStatus, BungalowType, Permission, Client, Reservation, ReservationStatus, Invoice, InvoiceStatus, MaintenanceRequest, MaintenanceStatus, MaintenancePriority, User, UserRole } from "./types";

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
  { path: '/communication', label: 'Communication', icon: 'communication', permission: 'communication:read' },
  { path: '/maintenance', label: 'Maintenance', icon: 'wrench', permission: 'maintenance:read' },
  { path: '/rapports', label: 'Rapports', icon: 'chart', permission: 'reports:read' },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: 'users', permission: 'users:read' },
  { path: '/parametres', label: 'Paramètres', icon: 'cog', permission: 'settings:read' },
  { path: '/profil', label: 'Mon Profil', icon: 'users' },
];

export const MOCK_BUNGALOWS: Bungalow[] = [
    {
        id: 'bungalow-1',
        name: 'Bungalow "Le Palmier"',
        type: BungalowType.Deluxe,
        status: BungalowStatus.Available,
        capacity: 2,
        pricePerNight: 15000,
        amenities: ['Climatisation', 'Wi-Fi', 'Vue sur mer', 'Mini-bar'],
        imageUrl: `https://picsum.photos/seed/bungalow1/400/300`,
        description: 'Un charmant bungalow avec une vue imprenable sur la mer Méditerranée.'
    },
    {
        id: 'bungalow-2',
        name: 'Bungalow "L\'Olivier"',
        type: BungalowType.Standard,
        status: BungalowStatus.Occupied,
        capacity: 4,
        pricePerNight: 12000,
        amenities: ['Climatisation', 'Wi-Fi', 'Cuisine équipée'],
        imageUrl: `https://picsum.photos/seed/bungalow2/400/300`,
        description: 'Parfait pour les petites familles, avec tout le confort nécessaire.'
    },
    {
        id: 'bungalow-3',
        name: 'Suite "Le Corail"',
        type: BungalowType.Suite,
        status: BungalowStatus.Cleaning,
        capacity: 2,
        pricePerNight: 25000,
        amenities: ['Climatisation', 'Wi-Fi', 'Jacuzzi privé', 'Service de chambre'],
        imageUrl: `https://picsum.photos/seed/bungalow3/400/300`,
        description: 'Le luxe absolu pour une escapade romantique inoubliable.'
    },
    {
        id: 'bungalow-4',
        name: 'Bungalow "Le Pin"',
        type: BungalowType.Family,
        status: BungalowStatus.Available,
        capacity: 6,
        pricePerNight: 20000,
        amenities: ['Climatisation', 'Wi-Fi', 'Deux chambres', 'Cuisine complète'],
        imageUrl: `https://picsum.photos/seed/bungalow4/400/300`,
        description: 'Spacieux et confortable, idéal pour les grandes familles ou les groupes.'
    },
     {
        id: 'bungalow-5',
        name: 'Bungalow "La Vague"',
        type: BungalowType.Standard,
        status: BungalowStatus.Maintenance,
        capacity: 2,
        pricePerNight: 10000,
        amenities: ['Climatisation', 'Wi-Fi'],
        imageUrl: `https://picsum.photos/seed/bungalow5/400/300`,
        description: 'Un bungalow simple et confortable, parfait pour un court séjour.'
    },
     {
        id: 'bungalow-6',
        name: 'Bungalow "Le Sable"',
        type: BungalowType.Deluxe,
        status: BungalowStatus.Available,
        capacity: 3,
        pricePerNight: 16000,
        amenities: ['Climatisation', 'Wi-Fi', 'Vue sur jardin', 'Terrasse privée'],
        imageUrl: `https://picsum.photos/seed/bungalow6/400/300`,
        description: 'Profitez de la tranquillité de notre jardin depuis votre terrasse privée.'
    }
];

export const MOCK_CLIENTS: Client[] = [
    { id: 'client-1', name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '0612345678', address: '12 Rue de la Paix, 75002 Paris', registrationDate: new Date('2023-05-15T10:00:00Z').toISOString(), loyaltyPoints: 120 },
    { id: 'client-2', name: 'Marie Curie', email: 'marie.curie@email.com', phone: '0687654321', address: '2 Place Jussieu, 75005 Paris', registrationDate: new Date('2024-01-20T14:30:00Z').toISOString(), loyaltyPoints: 450 },
    { id: 'client-3', name: 'Albert Camus', email: 'albert.camus@email.com', phone: '0611223344', address: '5 Rue de Médéa, 16000 Alger', registrationDate: new Date('2024-06-10T09:00:00Z').toISOString(), loyaltyPoints: 50 },
];

export const MOCK_RESERVATIONS: Reservation[] = [
    {
        id: 'res-1', bungalowId: 'bungalow-1', clientId: 'client-1',
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        status: ReservationStatus.Confirmed, totalPrice: 45000
    },
    {
        id: 'res-2', bungalowId: 'bungalow-2', clientId: 'client-2',
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        status: ReservationStatus.Confirmed, totalPrice: 48000
    },
    {
        id: 'res-3', bungalowId: 'bungalow-4', clientId: 'client-1',
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
        status: ReservationStatus.Confirmed, totalPrice: 100000
    },
    {
        id: 'res-4', bungalowId: 'bungalow-5', clientId: 'client-3',
        startDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        endDate: new Date().toISOString(),
        status: ReservationStatus.Confirmed, totalPrice: 20000
    },
    {
        id: 'res-5', bungalowId: 'bungalow-3', clientId: 'client-2',
        startDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        status: ReservationStatus.Pending, totalPrice: 75000
    }
];

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'INV-2024-001',
        reservationId: 'res-1',
        clientId: 'client-1',
        issueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 13)).toISOString(),
        totalAmount: 45000,
        status: InvoiceStatus.Unpaid,
        items: [
            {
                description: 'Séjour Bungalow "Le Palmier" (3 nuits)',
                quantity: 3,
                unitPrice: 15000,
                total: 45000
            }
        ]
    },
    {
        id: 'INV-2024-002',
        reservationId: 'res-3',
        clientId: 'client-1',
        issueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
        totalAmount: 105000,
        status: InvoiceStatus.Paid,
        items: [
            {
                description: 'Séjour Bungalow "Le Pin" (5 nuits)',
                quantity: 5,
                unitPrice: 20000,
                total: 100000
            },
            {
                description: 'Taxe de séjour',
                quantity: 1,
                unitPrice: 5000,
                total: 5000
            }
        ]
    },
     {
        id: 'INV-2024-003',
        reservationId: 'res-2', // This is a pending reservation, but let's imagine an invoice was made
        clientId: 'client-2',
        issueDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        totalAmount: 48000,
        status: InvoiceStatus.Overdue,
        items: [
            {
                description: 'Séjour Bungalow "L\'Olivier" (4 nuits)',
                quantity: 4,
                unitPrice: 12000,
                total: 48000
            }
        ]
    },
    {
        id: 'INV-2024-004',
        reservationId: 'res-5',
        clientId: 'client-2',
        issueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        totalAmount: 75000,
        status: InvoiceStatus.Cancelled,
        items: [
            {
                description: 'Séjour Suite "Le Corail" (3 nuits)',
                quantity: 3,
                unitPrice: 25000,
                total: 75000
            }
        ]
    }
];

export const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
    {
        id: 'maint-1',
        bungalowId: 'bungalow-5', // "La Vague" which is already in Maintenance status
        description: 'Le robinet de la salle de bain fuit.',
        status: MaintenanceStatus.InProgress,
        priority: MaintenancePriority.Medium,
        reportedBy: 'Eric Employé',
        assignedToId: 'user-manager', // Marie Manager
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'maint-2',
        bungalowId: 'bungalow-3', // Suite "Le Corail"
        description: 'L\'ampoule de la terrasse est grillée.',
        status: MaintenanceStatus.Pending,
        priority: MaintenancePriority.Low,
        reportedBy: 'Client: Albert Camus',
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'maint-3',
        bungalowId: 'bungalow-2', // "L'Olivier"
        description: 'Problème avec la climatisation, ne refroidit plus.',
        status: MaintenanceStatus.Resolved,
        priority: MaintenancePriority.High,
        reportedBy: 'Marie Manager',
        assignedToId: 'user-employee',
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        resolutionDetails: 'Le filtre à air a été nettoyé et le gaz rechargé.'
    }
];

export const formatDateDDMMYYYY = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return ''; // Invalid date check
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return '';
    }
};

export const formatDateTimeDDMMYYYY = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return ''; // Invalid date check
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} à ${hours}h${minutes}`;
    } catch (e) {
        return '';
    }
};


export const formatTimeAgo = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours} h`;
    if (days <= 7) return `il y a ${days} j`;
    return formatDateDDMMYYYY(date);
};

const ROLE_HIERARCHY: UserRole[] = [
  UserRole.Employee,
  UserRole.Manager,
  UserRole.Admin,
  UserRole.SuperAdmin,
];

export const getVisibleUsers = (currentUser: User | null, allUsers: User[]): User[] => {
  if (!currentUser) return [];

  const currentUserLevel = ROLE_HIERARCHY.indexOf(currentUser.role);
  if (currentUserLevel === -1) return []; // Should not happen

  return allUsers.filter(user => {
    const userLevel = ROLE_HIERARCHY.indexOf(user.role);
    return userLevel <= currentUserLevel;
  });
};