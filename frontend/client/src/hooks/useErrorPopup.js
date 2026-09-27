// src/hooks/useErrorPopup.js
import { useState, useCallback, useEffect } from 'react';

export const useErrorPopup = () => {
    // State to store the current error message
    const [error, setError] = useState('');

    // Function to display an error message with optional auto-clear duration
    const showError = useCallback((errorMessage, duration = 3000) => {
        setError(errorMessage);

        // Auto-clear error after specified duration (default 3 seconds)
        if (duration > 0) {
            setTimeout(() => {
                setError('');
            }, duration);
        }
    }, []);

    // Function to manually clear the error message
    const clearError = useCallback(() => {
        setError('');
    }, []);

    // Return error state and control functions for component use
    return {
        error,
        showError,
        clearError
    };
};
