// components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { Toast as ToastType, ToastType as TType } from '../../hooks/useToasts';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: number) => void;
}

const ICONS: Record<TType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
  ),
};

const COLORS: Record<TType, string> = {
  success: 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200',
  error: 'bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200',
  info: 'bg-blue-100 text-blue-500 dark:bg-blue-800 dark:text-blue-200',
  warning: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-800 dark:text-yellow-200',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const removeTimer = setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
        return () => clearTimeout(removeTimer);
    }, 4000); // 4 seconds visible

    return () => clearTimeout(exitTimer);
  }, [toast.id, onRemove]);
  
  const handleRemove = () => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`toast ${isExiting ? 'toast-exit' : 'toast-enter'} w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 ring-1 ring-black ring-opacity-5 flex items-center space-x-3`}
      role="alert"
    >
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${COLORS[toast.type]}`}>
            {ICONS[toast.type]}
        </div>
        <div className="text-sm font-normal">{toast.message}</div>
        <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={handleRemove}
        >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
    </div>
  );
};

export default Toast;
