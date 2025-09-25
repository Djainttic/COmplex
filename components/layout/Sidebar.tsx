

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS, NavItem } from '../../constants';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const icons: { [key: string]: React.ReactNode } = {
    home: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    calendar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    currency: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    star: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    communication: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    wrench: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-9-9" /></svg>,
    chart: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    cog: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const NavItemLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const location = useLocation();
    const isActive = location.pathname === item.path;
    const baseClasses = "flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-200 transform rounded-lg";
    const activeClasses = "bg-primary-600 text-white";
    const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <NavLink
            to={item.path}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icons[item.icon]}
            <span className="mx-4">{item.label}</span>
        </NavLink>
    )
}

const SidebarContent: React.FC = () => {
    const { hasPermission, settings, currentUser } = useAuth();

    // CRITICAL FIX: Prevent rendering if currentUser is not yet available.
    if (!currentUser) {
        return null;
    }

    const visibleNavItems = NAV_ITEMS.filter(item => {
        // SuperAdmin sees all modules regardless of their status
        if (currentUser?.role === UserRole.SuperAdmin) {
             return !item.permission || hasPermission(item.permission);
        }

        // Get module key from path (e.g., '/reservations' -> 'reservations')
        const moduleKey = item.path === '/' ? 'dashboard' : item.path.substring(1).replace('/', '');
        const isModuleActive = settings.moduleStatus[moduleKey] ?? true;

        return isModuleActive && (!item.permission || hasPermission(item.permission));
    });

    const mainNav = visibleNavItems.filter(item => item.path !== '/profil' && item.path !== '/parametres');
    const settingsNav = visibleNavItems.filter(item => item.path === '/parametres');
    const profileNav = visibleNavItems.filter(item => item.path === '/profil');

    return (
        <div className="flex flex-col justify-between flex-1">
            <nav className="space-y-2">
                {mainNav.map(item => <NavItemLink key={item.path} item={item} />)}
            </nav>
            <nav className="space-y-2">
                {settingsNav.map(item => <NavItemLink key={item.path} item={item} />)}
                {profileNav.map(item => <NavItemLink key={item.path} item={item} />)}
            </nav>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { settings } = useAuth();

    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-30 w-64 px-4 py-5 overflow-y-auto bg-white border-r dark:bg-gray-800 dark:border-gray-700 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between mb-6">
                    <a href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white">
                        <img className="w-8 h-8" src={settings.general.logoUrl} alt="Logo" />
                        <span>{settings.general.complexName}</span>
                    </a>
                </div>
                <SidebarContent />
            </div>
            {isOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;