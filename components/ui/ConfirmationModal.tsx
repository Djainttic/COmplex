import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'primary' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  variant = 'primary',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
        <div className="text-center">
            <svg aria-hidden="true" className={`mx-auto mb-4 h-14 w-14 ${variant === 'danger' ? 'text-red-400' : 'text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                {message}
            </p>
            <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={onClose}>
                    Annuler
                </Button>
                <Button variant={variant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </div>
        </div>
    </Modal>
  );
};

export default ConfirmationModal;