import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Note: This component is not currently used in the application.
// It's a placeholder for a potential feature to manage bungalow options/extras.

interface BungalowOptionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onSave: (option: any) => void;
    // option: any | null;
}

const BungalowOptionFormModal: React.FC<BungalowOptionFormModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gérer une option de bungalow"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={onClose}>Enregistrer</Button>
                </>
            }
        >
            <p>Le formulaire pour ajouter ou modifier une option de bungalow (ex: petit-déjeuner, lit bébé) s'affichera ici.</p>
        </Modal>
    );
};

export default BungalowOptionFormModal;
