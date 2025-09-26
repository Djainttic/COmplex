// constants.ts
import { Permission, User, UserRole } from './types';

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


// HELPER FUNCTIONS
export const formatDateDDMMYYYY = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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

export const getVisibleUsers = (currentUser: User | null, allUsers: User[]): User[] => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SuperAdmin) {
        return allUsers;
    }
    // Non-super-admins can't see super admins.
    return allUsers.filter(user => user.role !== UserRole.SuperAdmin);
};
