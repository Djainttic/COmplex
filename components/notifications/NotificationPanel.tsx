import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../types';
import { formatTimeAgo } from '../../constants';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const getIconForType = (type: NotificationType) => {
    switch (type) {
        case NotificationType.NewReservation:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case NotificationType.OverdueInvoice:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case NotificationType.UpcomingCheckIn:
             return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
        case NotificationType.MaintenanceAssigned:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;
        default:
            return null;
    }
};

const NotificationItem: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => (
    <li
        onClick={onClick}
        className="flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
    >
        {!notification.isRead && (
             <span className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-primary-500 rounded-full" aria-hidden="true"></span>
        )}
        <div className={`flex-shrink-0 ${notification.isRead ? 'ml-5' : ''}`}>
             {getIconForType(notification.type)}
        </div>
        <div className="ml-3 w-0 flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(notification.timestamp)}</p>
        </div>
    </li>
);

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
            <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                        Tout marquer comme lu
                    </button>
                )}
            </div>
            {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>Vous n'avez aucune notification.</p>
                </div>
            ) : (
                <ul className="max-h-96 overflow-y-auto p-2">
                    {sortedNotifications.map(notif => (
                        <NotificationItem key={notif.id} notification={notif} onClick={() => markAsRead(notif.id)} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPanel;