import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

const ToastIcon = ({ type }) => {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return <span className="text-lg">{icons[type]}</span>;
};

const Toast = ({ toast }) => {
    const { removeToast } = useToast();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        return () => setIsVisible(false);
    }, []);

    const getToastStyles = (type) => {
        const baseStyles = "flex items-center gap-3 p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out";
        const typeStyles = {
            success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300',
            error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300',
            info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
        };
        return `${baseStyles} ${typeStyles[type]} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`;
    };

    return (
        <div className={getToastStyles(toast.type)}>
            <ToastIcon type={toast.type} />
            <span className="flex-1 font-medium">{toast.message}</span>
            <button 
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-60 hover:opacity-100 font-bold text-xl leading-none"
            >
                ×
            </button>
        </div>
    );
};

const ToastContainer = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default ToastContainer;