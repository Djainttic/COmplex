import React from 'react';
import { Reservation, Bungalow, Client, ReservationStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDateDDMMYYYY } from '../../constants';

interface ReservationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation;
    bungalow: Bungalow;
    client: Client;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({ isOpen, onClose, reservation, bungalow, client }) => {
    
    const getStatusBadgeColor = (status: ReservationStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
        switch (status) {
            case ReservationStatus.Confirmed: return 'green';
            case ReservationStatus.Pending: return 'yellow';
            case ReservationStatus.Cancelled: return 'red';
            default: return 'gray';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Détails de la Réservation #${reservation.id.slice(0, 5)}`}
            footer={
                <Button variant="secondary" onClick={onClose}>Fermer</Button>
            }
        >
            <div className="space-y-6 text-sm">
                {/* Status */}
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Statut:</span>
                    <Badge color={getStatusBadgeColor(reservation.status)}>{reservation.status}</Badge>
                </div>
                
                {/* Bungalow Info */}
                <div>
                    <h4 className="font-semibold text-base mb-2 text-gray-800 dark:text-white border-b pb-1 dark:border-gray-600">Bungalow</h4>
                    <div className="space-y-1">
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Nom:</span> {bungalow.name}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Type:</span> {bungalow.type}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Capacité:</span> {bungalow.capacity} personnes</p>
                    </div>
                </div>

                {/* Client Info */}
                 <div>
                    <h4 className="font-semibold text-base mb-2 text-gray-800 dark:text-white border-b pb-1 dark:border-gray-600">Client</h4>
                    <div className="space-y-1">
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Nom:</span> {client.name}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {client.email}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Téléphone:</span> {client.phone}</p>
                    </div>
                </div>

                {/* Dates Info */}
                <div>
                    <h4 className="font-semibold text-base mb-2 text-gray-800 dark:text-white border-b pb-1 dark:border-gray-600">Période</h4>
                     <div className="space-y-1">
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Arrivée:</span> {formatDateDDMMYYYY(reservation.startDate)}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">Départ:</span> {formatDateDDMMYYYY(reservation.endDate)}</p>
                    </div>
                </div>

                 {/* Financial Info */}
                <div className="pt-4 border-t dark:border-gray-600">
                    <div className="flex justify-between items-center">
                         <span className="font-semibold text-gray-700 dark:text-gray-300 text-base">Montant total:</span>
                         <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{reservation.totalPrice} DZD</span>
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export default ReservationDetailsModal;