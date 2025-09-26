// components/ui/ToastContainer.tsx
import React from 'react';
import { useToasts } from '../../hooks/useToasts';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToasts();

    return (
        <div className="fixed top-5 right-5 z-[100] space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
