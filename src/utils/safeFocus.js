// src/utils/safeFocus.js - Yeni dosya oluşturun

export const safeFocus = (elementRef, delay = 0) => {
    if (delay > 0) {
        setTimeout(() => safeFocus(elementRef), delay);
        return;
    }

    try {
        if (elementRef && elementRef.current && typeof elementRef.current.focus === 'function') {
            elementRef.current.focus();
        }
    } catch (error) {
        console.warn('Focus error prevented:', error);
    }
};

export const safeClick = (elementRef) => {
    try {
        if (elementRef && elementRef.current && typeof elementRef.current.click === 'function') {
            elementRef.current.click();
        }
    } catch (error) {
        console.warn('Click error prevented:', error);
    }
};

// Component'lerde kullanım:
// import { safeFocus, safeClick } from '../utils/safeFocus';
// safeClick(fileInputRef); // elementRef.current.click() yerine