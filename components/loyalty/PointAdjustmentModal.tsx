import React, { useState } from 'react';
import { Client } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface PointAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (clientId: string, points: number, reason: string) => void;
    client: Client;
}

const PointAdjustmentModal: React.FC<PointAdjustmentModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (points === 0 || !reason.trim()) {
            alert('Veuillez spécifier un nombre de points (non nul) et une raison.');
            return;
        }
        onSave(client.id, points, reason);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Ajuster les points pour ${client.name}`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer l'ajustement</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Solde actuel</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.loyaltyPoints.toLocaleString('fr-FR')} points</p>
                </div>

                <div>
                    <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Points à ajouter ou retirer
                    </label>
                    <input
                        type="number"
                        name="points"
                        id="points"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                        required
                        placeholder="ex: 50 ou -20"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Utilisez un nombre négatif pour retirer des points.</p>
                </div>
                
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Raison de l'ajustement
                    </label>
                     <input
                        type="text"
                        name="reason"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        placeholder="ex: Geste commercial, correction d'erreur..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default PointAdjustmentModal;