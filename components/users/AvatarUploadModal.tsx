import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';

interface AvatarUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newUrl: string) => void;
    currentAvatarUrl: string;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ isOpen, onClose, onSave, currentAvatarUrl }) => {
    const [newAvatarUrl, setNewAvatarUrl] = useState(currentAvatarUrl);

    useEffect(() => {
        // Reset the preview URL to the current avatar when the modal is opened
        if (isOpen) {
            setNewAvatarUrl(currentAvatarUrl);
        }
    }, [isOpen, currentAvatarUrl]);

    const handleSave = () => {
        onSave(newAvatarUrl);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Changer la photo de profil"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                </>
            }
        >
            <ImageUpload value={newAvatarUrl} onChange={setNewAvatarUrl} />
        </Modal>
    );
};

export default AvatarUploadModal;