import React, { useState } from 'react';
import { Reservation, Client, Bungalow } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDateDDMMYYYY } from '../../constants';

interface SelectReservationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (selectedReservations: Reservation[]) => void;
    reservationsToInvoice: Reservation[];
    clients: Client[];
    bungalows: Bungalow[];
}

const SelectReservationsModal: React.FC<SelectReservationsModalProps> = ({
    isOpen,
    onClose,
    onGenerate,
    reservationsToInvoice,
    clients,
    bungalows
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const clientMap = new Map(clients.map(c => [c.id, c.name]));
    const bungalowMap = new Map(bungalows.map(b => [b.id, b.name]));

    const handleSelect = (reservationId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reservationId)) {
                newSet.delete(reservationId);
            } else {
                newSet.add(reservationId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(reservationsToInvoice.map(r => r.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleGenerateClick = () => {
        const selectedReservations = reservationsToInvoice.filter(r => selectedIds.has(r.id));
        onGenerate(selectedReservations);
    };

    const isAllSelected = selectedIds.size > 0 && selectedIds.size === reservationsToInvoice.length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sélectionner les réservations à facturer"
            size="2xl"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleGenerateClick} disabled={selectedIds.size === 0}>
                        Générer la/les facture(s) ({selectedIds.size})
                    </Button>
                </>
            }
        >
            {reservationsToInvoice.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                    Aucune réservation confirmée n'est en attente de facturation.
                </p>
            ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        aria-label="Sélectionner toutes les réservations"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Réservation</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Bungalow</th>
                                <th scope="col" className="px-6 py-3">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservationsToInvoice.map((res) => (
                                <tr key={res.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-4 p-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            checked={selectedIds.has(res.id)}
                                            onChange={() => handleSelect(res.id)}
                                            aria-labelledby={`reservation-label-${res.id}`}
                                        />
                                    </td>
                                    <th scope="row" id={`reservation-label-${res.id}`} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        #{res.id.slice(-5)}
                                        <span className="block font-normal text-gray-500 text-xs">
                                            {formatDateDDMMYYYY(res.startDate)} - {formatDateDDMMYYYY(res.endDate)}
                                        </span>
                                    </th>
                                    <td className="px-6 py-4">{clientMap.get(res.clientId) || 'Inconnu'}</td>
                                    <td className="px-6 py-4">{bungalowMap.get(res.bungalowId) || 'Inconnu'}</td>
                                    <td className="px-6 py-4">{res.totalPrice.toLocaleString('fr-FR')} DZD</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
};

export default SelectReservationsModal;