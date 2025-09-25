import React from 'react';
import { Reservation, Bungalow, ReservationStatus } from '../../types';
import { formatDateDDMMYYYY } from '../../constants';

interface ReservationsCalendarViewProps {
    startDate: Date;
    reservations: Reservation[];
    bungalows: Bungalow[];
    onSelectReservation: (reservation: Reservation) => void;
    onAddReservation: (bungalowId: string, date: Date) => void;
}

const ReservationsCalendarView: React.FC<ReservationsCalendarViewProps> = ({
    startDate,
    reservations,
    bungalows,
    onSelectReservation,
    onAddReservation
}) => {
    const numberOfDays = 7;
    
    // Ensure the week starts on Sunday
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() - startDate.getDay());

    const dates = Array.from({ length: numberOfDays }).map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });

    const getReservationStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Confirmed: return 'bg-green-500 border-green-700 hover:bg-green-600';
            case ReservationStatus.Pending: return 'bg-yellow-500 border-yellow-700 hover:bg-yellow-600';
            case ReservationStatus.Cancelled: return 'bg-red-500 border-red-700 hover:bg-red-600';
            default: return 'bg-gray-400 border-gray-600 hover:bg-gray-500';
        }
    };

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const today = new Date();

    const renderBungalowRow = (bungalow: Bungalow) => {
        const cells: React.ReactNode[] = [];

        // timeline will hold a reservation object for the first day of its rendering, and null for empty days.
        const timeline = new Array(numberOfDays).fill(null);

        // 1. Populate the timeline's starting points for visible reservations
        reservations.forEach(res => {
            if (res.bungalowId !== bungalow.id || res.status === ReservationStatus.Cancelled) {
                return;
            }

            const resStart = new Date(res.startDate);
            resStart.setHours(0, 0, 0, 0);
            const resEnd = new Date(res.endDate);
            resEnd.setHours(0, 0, 0, 0);

            for (let i = 0; i < dates.length; i++) {
                const day = dates[i];
                // Place reservation object on its starting day if visible...
                if (isSameDay(day, resStart)) {
                    timeline[i] = res;
                    break; // A reservation can only start once
                }
                // ...or on the first day of the week if it starts before and continues into the week.
                if (i === 0 && day > resStart && day < resEnd) {
                    timeline[i] = res;
                    break;
                }
            }
        });

        // 2. Render cells based on the populated timeline
        let i = 0;
        while (i < dates.length) {
            const date = dates[i];
            const isWeekend = date.getDay() === 5 || date.getDay() === 6;
            const timelineEntry = timeline[i];

            if (timelineEntry && typeof timelineEntry === 'object') {
                const reservation = timelineEntry as Reservation;
                const resStart = new Date(reservation.startDate);
                resStart.setHours(0, 0, 0, 0);
                const resEnd = new Date(reservation.endDate);
                resEnd.setHours(0, 0, 0, 0);

                // Calculate duration of the visible part of the reservation
                let duration = 0;
                for (let j = i; j < dates.length; j++) {
                    const day = dates[j];
                    if (day >= resStart && day < resEnd) {
                        duration++;
                    } else {
                        break;
                    }
                }
                
                cells.push(
                    <td key={date.toISOString()} colSpan={duration} className={`p-0 align-top`}>
                        <button
                            onClick={() => onSelectReservation(reservation)}
                            className={`w-full h-full p-2 text-left text-white text-sm rounded-md shadow-sm transition-colors ${getReservationStatusColor(reservation.status)}`}
                            style={{ minHeight: '4rem' }}
                        >
                            <span className="font-semibold">Rés. #{reservation.id.substring(0, 5)}</span>
                            <span className="block text-xs truncate">{reservation.status}</span>
                        </button>
                    </td>
                );
                i += duration;

            } else {
                // Cell is empty, render an addable slot
                cells.push(
                    <td key={date.toISOString()} className={`border-r border-dashed border-gray-200 dark:border-gray-700/50 ${isWeekend ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}>
                       <button
                            onClick={() => onAddReservation(bungalow.id, date)}
                            className="w-full h-full group flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            style={{ minHeight: '4rem' }}
                            // FIX: Pass date as an ISO string to `formatDateDDMMYYYY` which expects a string, not a Date object.
                            aria-label={`Ajouter une réservation pour ${bungalow.name} le ${formatDateDDMMYYYY(date.toISOString())}`}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </td>
                );
                i++;
            }
        }
        return cells;
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
                    <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 w-48 sticky left-0 bg-gray-50 dark:bg-gray-700">Bungalow</th>
                        {dates.map(date => {
                            const isWeekend = date.getDay() === 5 || date.getDay() === 6;
                            return (
                                <th key={date.toISOString()} className={`p-3 text-center text-sm font-semibold border-l dark:border-gray-600 min-w-[80px] ${isSameDay(date, today) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'} ${isWeekend ? 'bg-gray-100 dark:bg-gray-900/50' : ''}`}>
                                    <div className="flex flex-col items-center">
                                        <span>{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                                        <span className={`text-lg ${isSameDay(date, today) ? 'font-bold' : ''}`}>{date.getDate()}</span>
                                    </div>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {bungalows.map(bungalow => (
                        <tr key={bungalow.id}>
                            <th className="p-3 text-left text-sm font-medium text-gray-800 dark:text-white align-top sticky left-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style={{ height: '4.5rem' }}>
                                {bungalow.name}
                                <span className="block text-xs font-normal text-gray-500">{bungalow.type}</span>
                            </th>
                            {renderBungalowRow(bungalow)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReservationsCalendarView;
