import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ForgotPasswordModal from '../users/ForgotPasswordModal';

const LoginPage: React.FC = () => {
    const { login, settings } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); // Pre-fill Super Admin for convenience
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const { success, error } = await login(email, password);
        
        setIsLoading(false);
        if (success) {
            navigate('/');
        } else {
            setError(error || 'Une erreur est survenue.');
        }
    };

    return (
        <div 
            className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" 
            style={{ backgroundImage: `url('${settings.general.loginImageUrl || 'https://i.ibb.co/3W81zgx/syphax-bg.jpg'}')` }}
        >
            <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl">
                <div className="text-center">
                    <img className="w-16 h-16 mx-auto" src={settings.general.logoUrl} alt="Logo" />
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                        {settings.general.complexName}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Connectez-vous à votre espace de gestion
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Adresse e-mail</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Adresse e-mail"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Mot de passe"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Se souvenir de moi</label>
                        </div>
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => setForgotPasswordOpen(true)}
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
                    
                    <div>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </div>
                </form>
            </div>
            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
            />
        </div>
    );
};

export default LoginPage;