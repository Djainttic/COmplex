import React, { useState, useEffect } from 'react';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority, Bungalow, User } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface MaintenanceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (request: MaintenanceRequest) => void;
    request: MaintenanceRequest | null;
    bungalows: Bungalow[];
    users: User[];
}

const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({ isOpen, onClose, onSave, request, bungalows, users }) => {
    const { currentUser } = useAuth();
    const commonInputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm";

    const getInitialState = () => ({
        bungalowId: '',
        description: '',
        status: MaintenanceStatus.Pending,
        priority: MaintenancePriority.Medium,
        reportedBy: currentUser?.name || '',
        assignedToId: '',
        resolutionDetails: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (request) {
            setFormData({
                bungalowId: request.bungalowId,
                description: request.description,
                status: request.status,
                priority: request.priority,
                reportedBy: request.reportedBy,
                assignedToId: request.assignedToId || '',
                resolutionDetails: request.resolutionDetails || '',
            });
        } else {
            setFormData(getInitialState());
        }
    }, [request, isOpen, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const requestToSave: MaintenanceRequest = {
            id: request?.id || '',
            createdDate: request?.createdDate || '',
            ...formData,
            resolvedDate: formData.status === MaintenanceStatus.Resolved && !request?.resolvedDate 
                ? new Date().toISOString() 
                : (formData.status !== MaintenanceStatus.Resolved ? undefined : request?.resolvedDate),
        };
        onSave(requestToSave);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={request ? 'Modifier la demande' : 'Nouvelle demande de maintenance'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="bungalowId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bungalow concerné</label>
                    <select name="bungalowId" id="bungalowId" value={formData.bungalowId} onChange={handleChange} required className={`mt-1 ${commonInputStyle}`}>
                        <option value="" disabled>Sélectionner un bungalow</option>
                        {bungalows.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description du problème</label>
                    <textarea name="description" id="description" rows={4} value={formData.description} onChange={handleChange} required className={`mt-1 ${commonInputStyle}`} />
                </div>
                
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorité</label>
                        <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className={`mt-1 ${commonInputStyle}`}>
                            {(Object.values(MaintenancePriority) as string[]).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className={`mt-1 ${commonInputStyle}`}>
                            {(Object.values(MaintenanceStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="reportedBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Signalé par</label>
                        <input type="text" name="reportedBy" id="reportedBy" value={formData.reportedBy} onChange={handleChange} required className={`mt-1 ${commonInputStyle}`} />
                    </div>
                    <div>
                        <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigné à</label>
                        <select name="assignedToId" id="assignedToId" value={formData.assignedToId} onChange={handleChange} className={`mt-1 ${commonInputStyle}`}>
                            <option value="">Non assigné</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>

                {formData.status === MaintenanceStatus.Resolved && (
                    <div>
                        <label htmlFor="resolutionDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Détails de la résolution</label>
                        <textarea name="resolutionDetails" id="resolutionDetails" rows={3} value={formData.resolutionDetails} onChange={handleChange} placeholder="Décrire l'intervention effectuée..." className={`mt-1 ${commonInputStyle}`} />
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default MaintenanceFormModal;
