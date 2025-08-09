import React from 'react';
import { usePrivacyConsent } from './PrivacyConsentContext';

interface CookieBannerProps {
  onBannerClose: () => void;
  onShowPrivacyModal: () => void;
  onShowImpressumModal: () => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onBannerClose, onShowPrivacyModal, onShowImpressumModal }) => {
  const { acceptConsent, declineConsent } = usePrivacyConsent();

  const handleAccept = () => {
    acceptConsent();
    onBannerClose();
  };

  const handleDecline = () => {
    declineConsent();
    onBannerClose();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 z-40 animate-slide-in-up-banner">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-300 text-center sm:text-left">
            Diese App verwendet Technologien wie den <strong>Service Worker</strong> für Offline-Funktionalität und den <strong>Local Storage</strong>, um deine erstellten Spiel-Sets und persönlichen Einstellungen zu speichern. Ohne deine Zustimmung funktionieren diese Features nicht und die App verhält sich wie eine normale Webseite. Bist du einverstanden?
          </p>
          <div className="flex-shrink-0 flex items-center gap-3">
            <button
              onClick={handleDecline}
              className="bg-transparent hover:bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Ablehnen
            </button>
            <button
              onClick={handleAccept}
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Akzeptieren
            </button>
          </div>
        </div>
        <div className="flex justify-center sm:justify-start gap-x-4 mt-3 border-t border-gray-700 pt-3">
            <button onClick={onShowImpressumModal} className="text-xs text-gray-400 hover:text-white hover:underline transition-colors">
                Impressum
            </button>
            <button onClick={onShowPrivacyModal} className="text-xs text-gray-400 hover:text-white hover:underline transition-colors">
                Datenschutzerklärung
            </button>
        </div>
      </div>
       <style>{`
        @keyframes slide-in-up-banner {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-in-up-banner {
          animation: slide-in-up-banner 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>
    </div>
  );
};

export default CookieBanner;