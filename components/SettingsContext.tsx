import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import AgeVerificationModal from './AgeVerificationModal';
import { useNotification } from './Notification';
import { usePrivacyConsent } from './PrivacyConsentContext';

interface SettingsContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  show18PlusContent: boolean;
  request18PlusContent: () => void;
  disable18PlusContent: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const { consentGiven } = usePrivacyConsent();
  const storageErrorMsg = 'Einstellung konnte nicht gespeichert werden: Dein Browser-Speicher ist möglicherweise voll oder blockiert.';

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    if (consentGiven) {
        try {
            return localStorage.getItem('highContrastEnabled') === 'true';
        } catch {
            return false;
        }
    }
    return false;
  });

  const [show18PlusContent, setShow18PlusContent] = useState<boolean>(() => {
    if (consentGiven) {
        try {
            return localStorage.getItem('show18PlusContent') === 'true';
        } catch {
            return false;
        }
    }
    return false;
  });
  
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  useEffect(() => {
    if (consentGiven) {
        try {
            localStorage.setItem('highContrastEnabled', String(isHighContrast));
        } catch (e) {
            console.error("Could not save high contrast preference.", e);
            addNotification(storageErrorMsg, 'error');
        }
    }
  }, [isHighContrast, consentGiven, addNotification]);

  useEffect(() => {
    if (consentGiven) {
        try {
            localStorage.setItem('show18PlusContent', String(show18PlusContent));
        } catch (e) {
            console.error("Could not save 18+ content preference.", e);
            addNotification(storageErrorMsg, 'error');
        }
    }
  }, [show18PlusContent, consentGiven, addNotification]);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => !prev);
  }, []);
  
  const request18PlusContent = useCallback(() => {
    setIsAgeModalOpen(true);
  }, []);

  const disable18PlusContent = useCallback(() => {
    setShow18PlusContent(false);
  }, []);

  const handleVerificationSuccess = () => {
    setShow18PlusContent(true);
    addNotification('18+ Inhalte sind jetzt aktiviert.', 'success');
  };
  
  const handleVerificationRejected = () => {
    addNotification('Du musst volljährig sein, um diese Inhalte anzuzeigen.', 'error');
  };

  return (
    <SettingsContext.Provider value={{ isHighContrast, toggleHighContrast, show18PlusContent, request18PlusContent, disable18PlusContent }}>
      {children}
      <AgeVerificationModal
        isOpen={isAgeModalOpen}
        onClose={() => setIsAgeModalOpen(false)}
        onVerified={handleVerificationSuccess}
        onRejected={handleVerificationRejected}
      />
    </SettingsContext.Provider>
  );
};