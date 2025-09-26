import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>, password?: string) => void;
    user: User | null; // null for new user, User object for editing
}

const ROLE_HIERARCHY: UserRole[] = [
  UserRole.Employee,
  UserRole.Manager,
  UserRole.Admin,
  UserRole.SuperAdmin,
];

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const { currentUser, settings } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: UserRole.Employee,
        status: UserStatus.Active,
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isEditingSelf = useMemo(() => currentUser?.id === user?.id, [currentUser, user]);

    const availableRoles = useMemo(() => {
        if (!currentUser || currentUser.role === UserRole.SuperAdmin) {
            return Object.values(UserRole);
        }
        const currentUserLevel = ROLE_HIERARCHY.indexOf(currentUser.role);
        return ROLE_HIERARCHY.filter((_, index) => index < currentUserLevel);
    }, [currentUser]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                status: user.status,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: availableRoles[0] || UserRole.Employee,
                status: UserStatus.Active,
            });
            setPassword('');
            setConfirmPassword('');
        }
    }, [user, isOpen, availableRoles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave: Partial<User> = {
            ...user,
            ...formData,
        };

        if (!user) { // New user
            if (!password || password !== confirmPassword) {
                alert("Les mots de passe ne correspondent pas ou sont vides.");
                return;
            }
            if (password.length < settings.security.passwordPolicy.minLength) {
                alert(`Le mot de passe doit contenir au moins ${settings.security.passwordPolicy.minLength} caractères.`);
                return;
            }
            onSave(userToSave, password);
        } else { // Editing user
            onSave(userToSave);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Enregistrer</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                    <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={isEditingSelf}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    >
                        {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                    <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={isEditingSelf}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    >
                         {(Object.values(UserStatus) as string[]).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>

                {!user && (
                    <>
                        <div className="border-t dark:border-gray-600 pt-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm"
                            />
                        </div>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default UserFormModal;