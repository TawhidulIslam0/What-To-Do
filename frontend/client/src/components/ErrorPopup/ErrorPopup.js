// src/components/ErrorPopup/ErrorPopup.js
import React, { useEffect, useState } from 'react';
import './ErrorPopup.css';

const ErrorPopup = ({ error, onClose, type = 'success' }) => {
    // State to control popup visibility
    const [isVisible, setIsVisible] = useState(false);

    // Handle popup display and auto-close timing
    useEffect(() => {
        if (error) {
            setIsVisible(true);

            // Start fade out animation after 2.7 seconds
            const fadeOutTimer = setTimeout(() => {
                setIsVisible(false);
            }, 2700);

            // Close popup completely after 3 seconds
            const closeTimer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(closeTimer);
            };
        }
    }, [error, onClose]);

    // Don't render if no error message
    if (!error) return null;

    return (
        <div className={`error-popup ${type} ${!isVisible ? 'fade-out' : ''}`}>
            {error}
        </div>
    );
};

export default ErrorPopup;