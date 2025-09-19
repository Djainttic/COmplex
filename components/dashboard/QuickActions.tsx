import React from 'react';
import Button from '../ui/Button';

interface QuickActionsProps {
    onAddReservation: () => void;
    onAddClient: () => void;
    onAddMaintenance: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAddReservation, onAddClient, onAddMaintenance }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions Rapides</h3>
            <div className="space-y-3">
                <Button onClick={onAddReservation} size="md" className="w-full">
                    Nouvelle Réservation
                </Button>
                <Button onClick={onAddClient} variant="secondary" size="md" className="w-full">
                    Ajouter un Client
                </Button>
                <Button onClick={onAddMaintenance} variant="secondary" size="md" className="w-full">
                    Demande de Maintenance
                </Button>
            </div>
        </div>
    );
};

export default QuickActions;