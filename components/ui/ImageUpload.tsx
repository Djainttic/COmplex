import React, { useState, useRef } from 'react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, disabled = false }) => {
    const [tab, setTab] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner un fichier image valide (JPG, PNG, GIF...).');
            return;
        }

        setIsLoading(true);
        setError('');
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target?.result as string);
            setIsLoading(false);
        };
        reader.onerror = () => {
            setError('Erreur lors de la lecture du fichier.');
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleUrlApply = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
        }
    };
    
    const handleRemoveImage = () => {
        onChange('');
        setUrlInput('');
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const tabStyle = "px-4 py-2 text-sm font-medium transition-colors";
    const activeTabStyle = "bg-primary-600 text-white";
    const inactiveTabStyle = "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700";

    return (
        <div className={`mt-1 w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    ) : value ? (
                        <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={() => setTab('upload')} className={`${tabStyle} rounded-tl-md ${tab === 'upload' ? activeTabStyle : inactiveTabStyle}`} disabled={disabled}>Télécharger</button>
                        <button type="button" onClick={() => setTab('url')} className={`${tabStyle} rounded-tr-md ${tab === 'url' ? activeTabStyle : inactiveTabStyle}`} disabled={disabled}>Lien URL</button>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-md">
                        {tab === 'upload' ? (
                            <div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={disabled} />
                                <button type="button" onClick={triggerFileSelect} className="w-full text-sm px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:cursor-not-allowed" disabled={disabled}>
                                    Choisir un fichier...
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF, SVG, WEBP.</p>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://.../image.png"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm disabled:cursor-not-allowed"
                                    disabled={disabled}
                                />
                                <button type="button" onClick={handleUrlApply} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50" disabled={disabled}>Appliquer</button>
                            </div>
                        )}
                    </div>
                     {value && (
                        <button type="button" onClick={handleRemoveImage} className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 disabled:cursor-not-allowed" disabled={disabled}>
                            Retirer l'image
                        </button>
                    )}
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;