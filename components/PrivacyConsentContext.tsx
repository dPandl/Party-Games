import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { ALL_GAME_SET_STORAGE_KEYS, ALL_SETTINGS_STORAGE_KEYS } from '../constants';
import { useNotification } from './Notification';

const ALL_LOCAL_STORAGE_KEYS = ['cookiesAccepted', 'lastSeenVersion', ...ALL_GAME_SET_STORAGE_KEYS, ...ALL_SETTINGS_STORAGE_KEYS];

interface PrivacyConsentContextType {
  consentGiven: boolean;
  acceptConsent: () => void;
  declineConsent: () => void;
}

const PrivacyConsentContext = createContext<PrivacyConsentContextType | undefined>(undefined);

export const usePrivacyConsent = () => {
  const context = useContext(PrivacyConsentContext);
  if (!context) {
    throw new Error('usePrivacyConsent must be used within a PrivacyConsentProvider');
  }
  return context;
};

export const PrivacyConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const [consentGiven, setConsentGiven] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cookiesAccepted') === 'true';
    } catch {
      return false;
    }
  });

  const acceptConsent = useCallback(() => {
    try {
      localStorage.setItem('cookiesAccepted', 'true');
      setConsentGiven(true);
    } catch (e) {
        console.error("Could not set item in localStorage", e);
        addNotification('Speichern fehlgeschlagen: Dein Browser-Speicher ist möglicherweise voll oder blockiert.', 'error');
    }
  }, [addNotification]);

  const declineConsent = useCallback(() => {
    let errorOccurred = false;
    try {
      ALL_LOCAL_STORAGE_KEYS.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Could not remove ${key} from localStorage`, e);
            errorOccurred = true;
        }
      });
      sessionStorage.clear();
      setConsentGiven(false);
    } catch (e) {
        console.error("Could not access storage to decline consent", e);
        errorOccurred = true;
    }

    if (errorOccurred) {
        addNotification('Löschen der Daten fehlgeschlagen: Dein Browser-Speicher ist möglicherweise blockiert.', 'error');
    }
  }, [addNotification]);

  return (
    <PrivacyConsentContext.Provider value={{ consentGiven, acceptConsent, declineConsent }}>
      {children}
    </PrivacyConsentContext.Provider>
  );
};