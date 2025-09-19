// hooks/useNotifications.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Notification, NotificationType } from '../types';

// Mock Data
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        type: NotificationType.NewReservation,
        message: 'Nouvelle réservation pour Bungalow "Le Palmier" par Jean Dupont.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
        relatedId: 'res-1'
    },
    {
        id: 'notif-2',
        type: NotificationType.OverdueInvoice,
        message: 'Facture INV-2024-003 pour Marie Curie est en retard.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        relatedId: 'INV-2024-003'
    },
    {
        id: 'notif-3',
        type: NotificationType.UpcomingCheckIn,
        message: 'Arrivée prévue aujourd\'hui pour Albert Camus (Bungalow "Le Pin").',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        relatedId: 'res-4'
    },
     {
        id: 'notif-4',
        type: NotificationType.MaintenanceAssigned,
        message: 'Maintenance requise pour Bungalow "La Vague".',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        relatedId: 'bungalow-5'
    },
];

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
    };
    
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};


export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
