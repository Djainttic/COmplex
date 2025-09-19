import React from 'react';
import { Reservation, ReservationStatus } from '../../types';
import { MOCK_BUNGALOWS } from '../../constants';

interface CalendarMonthViewProps {
  date: Date;
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
}

const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({ date, reservations, onSelectReservation }) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = [];
  for (let day = new Date(firstDayOfMonth); day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
    daysInMonth.push(new Date(day));
  }
  
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const getReservationColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.Confirmed: return 'bg-green-500 hover:bg-green-600';
      case ReservationStatus.Pending: return 'bg-yellow-500 hover:bg-yellow-600';
      case ReservationStatus.Cancelled: return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  const today = new Date();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-start-${index}`} className="bg-gray-50 dark:bg-gray-900/50 rounded-md"></div>
        ))}
        {daysInMonth.map((day) => {
          const isWeekend = day.getDay() === 5 || day.getDay() === 6;
          return (
            <div key={day.toISOString()} className={`relative min-h-[120px] border border-gray-100 dark:border-gray-700/50 p-1 rounded-md ${isWeekend ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'}`}>
              <time dateTime={day.toISOString()} className={`flex items-center justify-center h-6 w-6 rounded-full font-semibold ${isSameDay(day, today) ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                {day.getDate()}
              </time>
              <div className="mt-1 space-y-1">
                {reservations
                  .filter(res => {
                      const startDate = new Date(res.startDate);
                      startDate.setHours(0,0,0,0);
                      const endDate = new Date(res.endDate);
                      endDate.setHours(0,0,0,0);
                      return day >= startDate && day <= endDate;
                  })
                  .map(res => {
                      const bungalow = MOCK_BUNGALOWS.find(b => b.id === res.bungalowId);
                      return (
                          <button 
                              key={res.id} 
                              onClick={() => onSelectReservation(res)}
                              className={`w-full text-left p-1 rounded-md text-white text-xs truncate ${getReservationColor(res.status)} transition-colors`}
                          >
                              {bungalow?.name || 'Bungalow Inconnu'}
                          </button>
                      )
                  })
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;