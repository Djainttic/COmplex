import React, { useState, useMemo } from 'react';
import { ReservationStatus, BungalowType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import ReportCard from '../reports/ReportCard';
import ReportFilters from '../reports/ReportFilters';
import RevenueByBungalowTypeChart from '../reports/RevenueByBungalowTypeChart';
import MonthlyRevenueChart from '../reports/MonthlyRevenueChart';

const ReportsPage: React.FC = () => {
    const { settings } = useAuth();
    const { bungalows, reservations } = useData();
    const [activePreset, setActivePreset] = useState<'7d' | '30d' | 'month' | 'custom'>('month');
    
    const getInitialDateRange = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    };

    const [dateRange, setDateRange] = useState(getInitialDateRange());

    const handlePresetChange = (preset: '7d' | '30d' | 'month') => {
        const end = new Date();
        let start = new Date();
        if (preset === '7d') start.setDate(end.getDate() - 7);
        if (preset === '30d') start.setDate(end.getDate() - 30);
        if (preset === 'month') start = new Date(end.getFullYear(), end.getMonth(), 1);
        
        setActivePreset(preset);
        setDateRange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        });
    };

    const handleDateChange = (startDate: string, endDate: string) => {
        setActivePreset('custom');
        setDateRange({ startDate, endDate });
    };

    const reportData = useMemo(() => {
        const start = new Date(dateRange.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        
        const periodReservations = reservations.filter(r => {
            const resStart = new Date(r.startDate);
            return resStart >= start && resStart <= end && r.status === ReservationStatus.Confirmed;
        });

        const totalRevenue = periodReservations.reduce((sum, r) => sum + r.totalPrice, 0);
        const totalReservations = periodReservations.length;

        // Occupancy calculation
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const totalBungalowNightsAvailable = bungalows.length * diffDays;
        
        let totalBungalowNightsOccupied = 0;
        reservations.forEach(r => {
             if (r.status === ReservationStatus.Confirmed) {
                const resStart = new Date(r.startDate);
                const resEnd = new Date(r.endDate);

                // Find intersection of reservation period and report period
                const overlapStart = new Date(Math.max(start.getTime(), resStart.getTime()));
                const overlapEnd = new Date(Math.min(end.getTime(), resEnd.getTime()));
                
                if (overlapEnd > overlapStart) {
                    // FIX: Use .getTime() for date arithmetic to prevent type errors.
                    const nights = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
                    totalBungalowNightsOccupied += nights;
                }
             }
        });
        
        const occupancyRate = totalBungalowNightsAvailable > 0
            ? (totalBungalowNightsOccupied / totalBungalowNightsAvailable) * 100
            : 0;

        // Revenue by bungalow type
        const bungalowMap = new Map(bungalows.map(b => [b.id, b.type]));
        const revenueByType = periodReservations.reduce((acc, r) => {
            const type = bungalowMap.get(r.bungalowId) || BungalowType.Standard;
            acc[type] = (acc[type] || 0) + r.totalPrice;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(revenueByType)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value);

        // Monthly revenue trends for the current year
        const currentYear = new Date().getFullYear();
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const monthlyRevenueData = monthNames.map(month => ({ month, revenue: 0 }));

        const yearlyConfirmedReservations = reservations.filter(r => {
            const resDate = new Date(r.startDate);
            return resDate.getFullYear() === currentYear && r.status === ReservationStatus.Confirmed;
        });
        
        yearlyConfirmedReservations.forEach(r => {
            const monthIndex = new Date(r.startDate).getMonth(); // 0-11
            monthlyRevenueData[monthIndex].revenue += r.totalPrice;
        });

        return {
            totalRevenue,
            totalReservations,
            occupancyRate,
            chartData,
            monthlyRevenueData
        };

    }, [dateRange, bungalows, reservations]);


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapports</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Analysez les performances de votre complexe sur différentes périodes.
            </p>

            <div className="mt-6">
                <ReportFilters
                    onDateChange={handleDateChange}
                    onPresetChange={handlePresetChange}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    activePreset={activePreset}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <ReportCard 
                    title="Revenu Total" 
                    value={`${reportData.totalRevenue.toLocaleString('fr-FR')} ${settings.financial.currency}`}
                    description={`sur ${reportData.totalReservations} réservation(s)`}
                />
                <ReportCard 
                    title="Taux d'Occupation" 
                    value={`${reportData.occupancyRate.toFixed(1)}%`}
                    description="Basé sur les nuits confirmées"
                />
                 <ReportCard 
                    title="Réservations Confirmées" 
                    value={reportData.totalReservations}
                    description="Dans la période sélectionnée"
                />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8">
                <RevenueByBungalowTypeChart data={reportData.chartData} currency={settings.financial.currency} />
                <MonthlyRevenueChart data={reportData.monthlyRevenueData} currency={settings.financial.currency} />
            </div>
        </div>
    );
};

export default ReportsPage;