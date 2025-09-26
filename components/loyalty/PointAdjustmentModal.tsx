// components/loyalty/PointAdjustmentModal.tsx
import React, { useState } from 'react';
import { Client } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface PointAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client, pointsChange: number, reason: string) => void;
    client: Client;
}

const PointAdjustmentModal: React.FC<PointAdjustmentModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const [pointsChange, setPointsChange] = useState(0);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pointsChange === 0 || !reason.trim()) {
            alert("Veuillez entrer une valeur de points et une raison.");
            return;
        }
        onSave(client, pointsChange, reason);
    };

    const currentPoints = client.loyaltyPoints || 0;
    const newTotal = currentPoints + pointsChange;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Ajuster les points de ${client.name}`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer l'ajustement</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Points actuels</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPoints.toLocaleString('fr-FR')}</p>
                </div>
                <div>
                    <label htmlFor="pointsChange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Changement (+/-)
                    </label>
                    <input
                        type="number"
                        id="pointsChange"
                        value={pointsChange}
                        onChange={(e) => setPointsChange(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                        placeholder="Ex: 50 ou -20"
                    />
                </div>
                 <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Raison de l'ajustement
                    </label>
                    <input
                        type="text"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                        placeholder="Ex: Geste commercial, Correction..."
                    />
                </div>
                <div className="p-4 border-t dark:border-gray-600 text-center">
                     <p className="text-sm text-gray-600 dark:text-gray-400">Nouveau total</p>
                    <p className={`text-2xl font-bold ${pointsChange > 0 ? 'text-green-600' : pointsChange < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {newTotal.toLocaleString('fr-FR')} points
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default PointAdjustmentModal;
