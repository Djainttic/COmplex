import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const { sendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await sendPasswordResetEmail(email);
        setIsLoading(false);
        if (result.success) {
            setIsSubmitted(true);
        } else {
            setError(result.error || 'Une erreur est survenue.');
        }
    };

    // Reset state when modal is closed to ensure it's fresh for next opening
    const handleCloseAndReset = () => {
        onClose();
        setTimeout(() => {
            setEmail('');
            setError('');
            setIsLoading(false);
            setIsSubmitted(false);
        }, 300); // Delay reset to allow modal closing animation
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseAndReset}
            title="Réinitialiser le mot de passe"
            size="md"
            footer={!isSubmitted ? (
                <>
                    <Button variant="secondary" onClick={handleCloseAndReset} disabled={isLoading}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    </Button>
                </>
            ) : <Button onClick={handleCloseAndReset}>Fermer</Button>}
        >
            {isSubmitted ? (
                <div className="text-center">
                    <svg className="mx-auto mb-4 h-14 w-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vérifiez votre boîte de réception</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Si un compte est associé à <strong>{email}</strong>, un e-mail contenant un lien de réinitialisation a été envoyé.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Saisissez votre adresse e-mail. Vous recevrez un lien pour créer un nouveau mot de passe.
                    </p>
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                        <input
                            type="email"
                            name="email"
                            id="reset-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                            placeholder="vous@exemple.com"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
            )}
        </Modal>
    );
};

export default ForgotPasswordModal;