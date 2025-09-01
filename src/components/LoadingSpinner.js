import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue', text = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8', 
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        green: 'border-green-600',
        red: 'border-red-600',
        gray: 'border-gray-600'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} border-4 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
            {text && <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
        </div>
    );
};

export const LoadingOverlay = ({ isVisible, text = 'Yükleniyor...' }) => {
    if (!isVisible) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <LoadingSpinner size="lg" text={text} />
            </div>
        </div>
    );
};

export const LoadingButton = ({ loading, children, ...props }) => {
    return (
        <button 
            {...props} 
            disabled={loading || props.disabled}
            className={`${props.className} ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Yükleniyor...</span>
                </div>
            ) : children}
        </button>
    );
};

export default LoadingSpinner;