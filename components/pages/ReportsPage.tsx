import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from 'https://aistudiocdn.com/@google/genai@^1.20.0';
import { ReservationStatus, BungalowType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import ReportCard from '../reports/ReportCard';
import ReportFilters from '../reports/ReportFilters';
import RevenueByBungalowTypeChart from '../reports/RevenueByBungalowTypeChart';
import MonthlyRevenueChart from '../reports/MonthlyRevenueChart';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatDateDDMMYYYY } from '../../constants';

const ReportsPage: React.FC = () => {
    const { settings } = useAuth();
    const { bungalows, reservations } = useData();
    const [activePreset, setActivePreset] = useState<'7d' | '30d' | 'month' | 'custom'>('month');
    
    // State for AI Summary
    const [isSummaryLoading, setSummaryLoading] = useState(false);
    const [summaryContent, setSummaryContent] = useState('');
    const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);

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

    const handleGenerateSummary = async () => {
        setSummaryLoading(true);
        setSummaryContent('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const revenueByTypeString = reportData.chartData.length > 0
                ? reportData.chartData.map(item => `- ${item.name}: ${item.value.toLocaleString('fr-FR')} ${settings.financial.currency}`).join('\n')
                : "Aucun revenu enregistré pour cette période.";

            const prompt = `
            Agis comme un analyste de données pour un complexe hôtelier nommé "SYPHAX". Analyse les données suivantes pour la période du ${formatDateDDMMYYYY(dateRange.startDate)} au ${formatDateDDMMYYYY(dateRange.endDate)}:

            - Revenu Total: ${reportData.totalRevenue.toLocaleString('fr-FR')} ${settings.financial.currency}
            - Nombre total de réservations confirmées: ${reportData.totalReservations}
            - Taux d'occupation moyen: ${reportData.occupancyRate.toFixed(1)}%
            - Répartition des revenus par type de bungalow:
            ${revenueByTypeString}

            Rédige un résumé analytique concis en 3 ou 4 phrases. Commence par "Analyse IA :". Mets en évidence le point le plus important (positif ou négatif) et termine par une suggestion ou une question pertinente pour aider le manager. Le ton doit être professionnel et direct.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setSummaryContent(response.text);
            setSummaryModalOpen(true);

        } catch (error) {
            console.error("Error generating AI summary:", error);
            alert("Une erreur est survenue lors de la génération du résumé IA. Veuillez vérifier la console pour plus de détails.");
        } finally {
            setSummaryLoading(false);
        }
    };


    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapports</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Analysez les performances de votre complexe sur différentes périodes.
                    </p>
                </div>
                {settings.moduleStatus.ai && (
                    <Button onClick={handleGenerateSummary} disabled={isSummaryLoading} variant="secondary">
                        {isSummaryLoading ? (
                             <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        )}
                        Générer un résumé IA
                    </Button>
                )}
            </div>

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

            {isSummaryModalOpen && (
                <Modal
                    isOpen={isSummaryModalOpen}
                    onClose={() => setSummaryModalOpen(false)}
                    title="Résumé de l'Analyse IA"
                    footer={<Button onClick={() => setSummaryModalOpen(false)}>Fermer</Button>}
                >
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans">
                        {summaryContent}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ReportsPage;