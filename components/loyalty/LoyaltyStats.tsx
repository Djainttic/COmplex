import React, { useMemo } from 'react';
import { Client, Settings } from '../../types';
import StatCard from '../ui/StatCard';

interface LoyaltyStatsProps {
    clients: Client[];
    settings: Settings;
}

const LoyaltyStats: React.FC<LoyaltyStatsProps> = ({ clients, settings }) => {
    const stats = useMemo(() => {
        const totalMembers = clients.length;
        const totalPoints = clients.reduce((sum, client) => sum + client.loyaltyPoints, 0);
        const totalValue = totalPoints * settings.loyalty.pointsToCurrencyValue;
        return { totalMembers, totalPoints, totalValue };
    }, [clients, settings.loyalty.pointsToCurrencyValue]);

    const icons = {
        members: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-9-9" /></svg>,
        points: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
        value: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Clients membres" value={`${stats.totalMembers}`} icon={icons.members} />
            <StatCard title="Total des Points" value={`${stats.totalPoints.toLocaleString('fr-FR')}`} icon={icons.points} />
            <StatCard title="Valeur Totale des Points" value={`${stats.totalValue.toLocaleString('fr-FR')} ${settings.financial.currency}`} icon={icons.value} />
        </div>
    );
};

export default LoyaltyStats;
