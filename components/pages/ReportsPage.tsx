// components/pages/ReportsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { BungalowStatus, BungalowType, InvoiceStatus } from '../../types';
import ReportCard from '../reports/ReportCard';
import ReportFilters from '../reports/ReportFilters';
import MonthlyRevenueChart from '../reports/MonthlyRevenueChart';
import RevenueByBungalowTypeChart from '../reports/RevenueByBungalowTypeChart';

type Preset = '7d' | '30d' | 'month' | 'custom';

const ReportsPage: React.FC = () => {
    const { invoices, reservations, bungalows, fetchInvoices, fetchReservations, fetchBungalows, isLoading } = useData();
    const { settings } = useAuth();
    
    useEffect(() => {
        fetchInvoices();
        fetchReservations();
        fetchBungalows();
    }, [fetchInvoices, fetchReservations, fetchBungalows]);

    const getInitialDateRange = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29); // Default to last 30 days
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
        };
    };

    const [startDate, setStartDate] = useState(getInitialDateRange().start);
    const [endDate, setEndDate] = useState(getInitialDateRange().end);
    const [activePreset, setActivePreset] = useState<Preset>('30d');

    const handleDateChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        setActivePreset('custom');
    };

    const handlePresetChange = (preset: '7d' | '30d' | 'month') => {
        const end = new Date();
        const start = new Date();
        if (preset === '7d') {
            start.setDate(end.getDate() - 6);
        } else if (preset === '30d') {
            start.setDate(end.getDate() - 29);
        } else if (preset === 'month') {
            start.setDate(1);
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        setActivePreset(preset);
    };

    const reportData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        const paidInvoicesInRange = invoices.filter(i => {
            const issueDate = new Date(i.issueDate);
            return i.status === InvoiceStatus.Paid && issueDate >= start && issueDate <= end;
        });

        const reservationsInRange = reservations.filter(r => {
            const resStart = new Date(r.startDate);
            return resStart >= start && resStart <= end;
        });

        const totalRevenue = paidInvoicesInRange.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalReservations = reservationsInRange.length;
        
        const nightCount = reservationsInRange.reduce((sum, res) => {
            const resStart = new Date(res.startDate);
            const resEnd = new Date(res.endDate);
            return sum + (resEnd.getTime() - resStart.getTime()) / (1000 * 3600 * 24);
        }, 0);

        const totalPossibleNights = bungalows.length * ((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const occupancyRate = totalPossibleNights > 0 ? (nightCount / totalPossibleNights) * 100 : 0;
        
        return { totalRevenue, totalReservations, occupancyRate: occupancyRate.toFixed(1) };
    }, [startDate, endDate, invoices, reservations, bungalows]);

    const revenueByBungalowTypeData = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const revenueMap = new Map<BungalowType, number>();

        invoices.forEach(inv => {
            const issueDate = new Date(inv.issueDate);
             if (inv.status === InvoiceStatus.Paid && issueDate >= start && issueDate <= end) {
                const reservation = reservations.find(r => r.id === inv.reservationId);
                const bungalow = bungalows.find(b => b.id === reservation?.bungalowId);
                if (bungalow) {
                    revenueMap.set(bungalow.type, (revenueMap.get(bungalow.type) || 0) + inv.totalAmount);
                }
            }
        });
        
        return Array.from(revenueMap.entries()).map(([name, value]) => ({ name, value }));

    }, [startDate, endDate, invoices, reservations, bungalows]);
    
    const monthlyRevenueData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.Paid && new Date(inv.issueDate).getFullYear() === currentYear);
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
            revenue: 0
        }));
        paidInvoices.forEach(inv => {
            const monthIndex = new Date(inv.issueDate).getMonth();
            monthlyData[monthIndex].revenue += inv.totalAmount;
        });
        return monthlyData;
    }, [invoices]);


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Rapports & Statistiques</h1>
            
            <ReportFilters
                onDateChange={handleDateChange}
                onPresetChange={handlePresetChange}
                startDate={startDate}
                endDate={endDate}
                activePreset={activePreset}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <ReportCard title="Revenus totaux" value={`${reportData.totalRevenue.toLocaleString('fr-FR')} ${settings.financial.currency}`} description="Sur la période sélectionnée" />
                <ReportCard title="Réservations" value={reportData.totalReservations} description="Nouvelles réservations sur la période" />
                <ReportCard title="Taux d'occupation" value={`${reportData.occupancyRate}%`} description="Basé sur les nuitées réservées" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <MonthlyRevenueChart data={monthlyRevenueData} currency={settings.financial.currency} />
                </div>
                 <div>
                    <RevenueByBungalowTypeChart data={revenueByBungalowTypeData} currency={settings.financial.currency} />
                </div>
                {/* Can add more charts here */}
            </div>
        </div>
    );
};

export default ReportsPage;
