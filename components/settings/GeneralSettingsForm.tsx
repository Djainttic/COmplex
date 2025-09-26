import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';

const GeneralSettingsForm: React.FC = () => {
    const { settings, updateSettings, hasPermission } = useAuth();
    const [formData, setFormData] = useState(settings.general);
    const canWrite = hasPermission('settings:write');

    useEffect(() => {
        setFormData(settings.general);
    }, [settings.general]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };
    
    const handleAddGalleryImage = (url: string) => {
        if (url && !(formData.galleryImageUrls || []).includes(url)) {
            setFormData(prev => ({
                ...prev,
                galleryImageUrls: [...(prev.galleryImageUrls || []), url]
            }));
        }
    };
    
    const handleRemoveGalleryImage = (urlToRemove: string) => {
         setFormData(prev => ({
            ...prev,
            galleryImageUrls: (prev.galleryImageUrls || []).filter(url => url !== urlToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({ ...settings, general: formData });
        alert("Paramètres généraux mis à jour !");
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
            {/* General Information Section */}
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Informations Générales</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Informations de base sur votre établissement.</p>
                
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="complexName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du complexe</label>
                        <input
                            type="text"
                            name="complexName"
                            id="complexName"
                            value={formData.complexName}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
                    </div>

                     <div className="sm:col-span-2">
                        <label htmlFor="bungalowCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de bungalows</label>
                        <input
                            type="number"
                            name="bungalowCount"
                            id="bungalowCount"
                            value={formData.bungalowCount}
                            onChange={handleChange}
                            disabled={!canWrite}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-8">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Apparence</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Personnalisez l'apparence visuelle de l'application.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                        <ImageUpload
                            value={formData.logoUrl}
                            onChange={(url) => setFormData(prev => ({...prev, logoUrl: url}))}
                            disabled={!canWrite}
                        />
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image de fond (Page de connexion)</label>
                        <ImageUpload
                            value={formData.loginImageUrl}
                            onChange={(url) => setFormData(prev => ({...prev, loginImageUrl: url}))}
                            disabled={!canWrite}
                        />
                    </div>

                     <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Galerie d'images du complexe</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ces images pourront être utilisées par le manager pour les bungalows, ou dans d'autres modules.</p>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {(formData.galleryImageUrls || []).map(url => (
                                <div key={url} className="relative group aspect-w-1 aspect-h-1">
                                    <img src={url} alt="Galerie" className="w-full h-32 object-cover rounded-md" />
                                    {canWrite && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGalleryImage(url)}
                                            className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                                            aria-label="Supprimer l'image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                         {canWrite && (
                             <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ajouter une nouvelle image à la galerie</h4>
                                <ImageUpload value="" onChange={handleAddGalleryImage} disabled={!canWrite} />
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {canWrite && (
                <div className="pt-6 text-right">
                    <Button type="submit">Enregistrer les modifications</Button>
                </div>
            )}
        </form>
    );
};

export default GeneralSettingsForm;