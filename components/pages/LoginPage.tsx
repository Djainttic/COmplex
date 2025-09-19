import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const LoginPage: React.FC = () => {
    const { login, settings } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@bungalow.dz'); // Pre-fill for convenience
    const [password, setPassword] = useState('password'); // Dummy password
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = await login(email, password);
        setIsLoading(false);
        if (success) {
            navigate('/');
        } else {
            setError('Email ou mot de passe incorrect.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <img className="w-16 h-16 mx-auto" src={settings.general.logoUrl} alt="Logo" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {settings.general.complexName}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Connectez-vous à votre compte
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Mot de passe"
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-center text-red-600">{error}</p>}
                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
