import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NotificationProvider } from './components/Notification';
import { PrivacyConsentProvider } from './components/PrivacyConsentContext';
import { SettingsProvider } from './components/SettingsContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <PrivacyConsentProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </PrivacyConsentProvider>
    </NotificationProvider>
  </React.StrictMode>
);