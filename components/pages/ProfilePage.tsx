
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import AvatarUploadModal from '../users/AvatarUploadModal';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone || '',
            });
        }
    }, [currentUser]);
    
    if (!currentUser) {
        return <div>Chargement du profil...</div>;
    }

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({ ...currentUser, ...formData });
        // In a real app, show a success toast
        alert("Profil mis à jour !");
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        // In a real app, you would verify the current password and then update it
        alert("Mot de passe mis à jour ! (Simulation)");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleAvatarSave = (newAvatarUrl: string) => {
        updateUser({ ...currentUser, avatarUrl: newAvatarUrl });
        setAvatarModalOpen(false);
    };

    const inputStyle = "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm";

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gérez vos informations personnelles et vos paramètres de sécurité.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile Card and Actions */}
                <div className="md:col-span-1">
                     <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                        <img className="h-24 w-24 rounded-full object-cover mx-auto" src={currentUser.avatarUrl} alt="Your avatar" />
                        <h2 className="text-xl font-semibold mt-4">{currentUser.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                         <Button variant="secondary" size="sm" className="mt-4" onClick={() => setAvatarModalOpen(true)}>Changer la photo</Button>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="md:col-span-2 space-y-8">
                    {/* Personal Information Form */}
                    <form onSubmit={handleInfoSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Informations Personnelles</h3>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom & Prénom</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleInfoChange} className={`mt-1 block w-full ${inputStyle}`} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleInfoChange} disabled className={`mt-1 block w-full ${inputStyle} disabled:opacity-50`} />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInfoChange} className={`mt-1 block w-full ${inputStyle}`} />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <Button type="submit">Enregistrer les modifications</Button>
                        </div>
                    </form>

                    {/* Password Change Form */}
                    <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Changer le mot de passe</h3>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe actuel</label>
                                <input type="password" name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className={`mt-1 block w-full ${inputStyle}`} />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau mot de passe</label>
                                <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={`mt-1 block w-full ${inputStyle}`} />
                            </div>
                             <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmer le nouveau mot de passe</label>
                                <input type="password" name="confirmPassword" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={`mt-1 block w-full ${inputStyle}`} />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <Button type="submit">Changer le mot de passe</Button>
                        </div>
                    </form>
                </div>
            </div>

            <AvatarUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                onSave={handleAvatarSave}
                currentAvatarUrl={currentUser.avatarUrl}
            />
        </div>
    );
};

export default ProfilePage;