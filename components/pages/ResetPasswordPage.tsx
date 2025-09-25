import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const ResetPasswordPage: React.FC = () => {
    const { updatePassword, settings, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (password.length < settings.security.passwordPolicy.minLength) {
             setError(`Le mot de passe doit contenir au moins ${settings.security.passwordPolicy.minLength} caractères.`);
             return;
        }

        setError('');
        setSuccess('');
        setIsLoading(true);

        const result = await updatePassword(password);
        setIsLoading(false);

        if (result.success) {
            setSuccess('Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant retourner à la page de connexion.');
        } else {
            setError(result.error || 'Une erreur est survenue.');
        }
    };

    return (
        <div 
            className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" 
            style={{ backgroundImage: `url('https://i.ibb.co/3W81zgx/syphax-bg.jpg')` }}
        >
            <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl">
                <div className="text-center">
                    <img className="w-16 h-16 mx-auto" src={settings.general.logoUrl} alt="Logo" />
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                        Réinitialiser votre mot de passe
                    </h1>
                </div>

                {success ? (
                    <div className="text-center">
                        <p className="text-green-700 dark:text-green-400">{success}</p>
                        <Button onClick={logout} className="mt-4">
                            Retour à la page de connexion
                        </Button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Veuillez choisir un nouveau mot de passe.
                        </p>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="new-password" className="sr-only">Nouveau mot de passe</label>
                                <input
                                    id="new-password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Nouveau mot de passe"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">Confirmer le mot de passe</label>
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Confirmer le mot de passe"
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
                        
                        <div>
                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
