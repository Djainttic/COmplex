import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface UserCreationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    temporaryPassword: string;
  };
}

const UserCreationSuccessModal: React.FC<UserCreationSuccessModalProps> = ({ isOpen, onClose, credentials }) => {
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: show a small "copied" tooltip
        });
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Utilisateur créé avec succès"
            size="md"
            footer={<Button onClick={onClose}>Fermer</Button>}
        >
            <div className="text-center">
                 <svg className="mx-auto mb-4 h-14 w-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Veuillez communiquer les informations suivantes au nouvel utilisateur. Il devra changer son mot de passe lors de sa première connexion.
                </p>
                <div className="space-y-3 text-left">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Adresse e-mail</label>
                        <p className="font-mono text-sm text-gray-800 dark:text-white">{credentials.email}</p>
                    </div>
                     <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Mot de passe temporaire</label>
                         <div className="flex items-center justify-between">
                            <p className="font-mono text-sm text-gray-800 dark:text-white">{credentials.temporaryPassword}</p>
                            <button 
                                onClick={() => copyToClipboard(credentials.temporaryPassword)}
                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Copier le mot de passe"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default UserCreationSuccessModal;