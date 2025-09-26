import React, { useState } from 'react';
import { Client, CommunicationLog } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CommunicationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<CommunicationLog, 'id' | 'sentDate' | 'sentBy'>) => void;
    clients: Client[];
}

const CommunicationFormModal: React.FC<CommunicationFormModalProps> = ({ isOpen, onClose, onSave, clients }) => {
    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleClientSelect = (clientId: string) => {
        setSelectedClientIds(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedClientIds(clients.map(c => c.id));
        } else {
            setSelectedClientIds([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClientIds.length === 0 || !subject.trim() || !body.trim()) {
            alert('Veuillez sélectionner des destinataires et remplir tous les champs.');
            return;
        }
        onSave({
            recipients: selectedClientIds,
            subject,
            body,
            status: 'Envoyé'
        });
    };
    
    const isAllSelected = selectedClientIds.length > 0 && selectedClientIds.length === clients.length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Envoyer un message"
            size="2xl"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Envoyer le message</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destinataires</label>
                    <div className="mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                        <div className="flex items-center border-b dark:border-gray-600 pb-2 mb-2">
                             <input
                                id="select-all-clients"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                            <label htmlFor="select-all-clients" className="ml-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Sélectionner tous les clients ({selectedClientIds.length} / {clients.length})
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {clients.map(client => (
                                <div key={client.id} className="flex items-center">
                                    <input
                                        id={`client-${client.id}`}
                                        type="checkbox"
                                        checked={selectedClientIds.includes(client.id)}
                                        onChange={() => handleClientSelect(client.id)}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label htmlFor={`client-${client.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">{client.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sujet</label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                    <textarea
                        name="body"
                        id="body"
                        rows={6}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default CommunicationFormModal;
