// components/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import AvatarUploadModal from '../users/AvatarUploadModal';
import { useToasts } from '../../hooks/useToasts';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    const { addToast } = useToasts();
    
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
    
    // State for profile info form
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');

    if (!currentUser) {
        return <div>Chargement du profil...</div>;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUser({ id: currentUser.id, name, email, phone });
        addToast({ message: 'Profil mis à jour avec succès.', type: 'success' });
    };

    const handleAvatarSave = async (newUrl: string) => {
        await updateUser({ id: currentUser.id, avatarUrl: newUrl });
        addToast({ message: 'Photo de profil mise à jour.', type: 'success' });
        setAvatarModalOpen(false);
    };

    const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm";

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="p-6 sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex sm:items-center sm:space-x-5">
                            <div className="relative">
                                <img className="h-20 w-20 rounded-full object-cover" src={currentUser.avatarUrl} alt="Avatar" />
                                <button
                                    onClick={() => setAvatarModalOpen(true)}
                                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
                                    title="Changer l'avatar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h1>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {/* Profile Information Form */}
                    <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations du profil</h3>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className={commonInputStyle} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={commonInputStyle} />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={commonInputStyle} />
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <Button type="submit">Enregistrer</Button>
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
        </>
    );
};

export default ProfilePage;
