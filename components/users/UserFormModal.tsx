import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null; // null for new user, User object for editing
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: UserRole.Employee,
        status: UserStatus.Active,
    });

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
                role: UserRole.Employee,
                status: UserStatus.Active,
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave: User = {
            ...user, // includes id if editing
            ...formData,
            id: user?.id || '', // id will be set in parent for new users
            avatarUrl: user?.avatarUrl || '', // avatar will be set in parent for new users
            lastLogin: user?.lastLogin || new Date().toISOString(),
            isOnline: user?.isOnline || false,
            permissions: user?.permissions || [], // Ensure permissions array exists
        };
        onSave(userToSave);
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
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        {(Object.values(UserRole) as string[]).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                    <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                         {(Object.values(UserStatus) as string[]).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default UserFormModal;