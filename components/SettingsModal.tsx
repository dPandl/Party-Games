import React from 'react';
import { useSettings } from './SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    isHighContrast, 
    toggleHighContrast,
    show18PlusContent,
    request18PlusContent,
    disable18PlusContent
  } = useSettings();

  if (!isOpen) {
    return null;
  }

  const handleAdultContentToggle = () => {
    if (show18PlusContent) {
      disable18PlusContent();
    } else {
      request18PlusContent();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md space-y-6 border border-gray-700 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-teal-400">Einstellungen</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2">Allgemein</h3>
              <label htmlFor="adult-content-toggle" className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-700/50">
                  <span className="text-gray-200 font-medium">
                      18+ Inhalte anzeigen
                      <p className="text-xs text-gray-400 font-normal">Schaltet potenziell nicht jugendfreie Sets frei.</p>
                  </span>
                  <div className="relative">
                      <input
                      type="checkbox"
                      id="adult-content-toggle"
                      className="sr-only peer"
                      checked={show18PlusContent}
                      onChange={handleAdultContentToggle}
                      />
                      <div className="block bg-gray-600 w-14 h-8 rounded-full peer-checked:bg-red-500 transition"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
                  </div>
              </label>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2">Barrierefreiheit</h3>
              <label htmlFor="contrast-toggle" className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-700/50">
                  <span className="text-gray-200 font-medium">
                      Modus für hohen Kontrast
                      <p className="text-xs text-gray-400 font-normal">Verbessert die Lesbarkeit durch stärkere Farben.</p>
                  </span>
                  <div className="relative">
                      <input
                      type="checkbox"
                      id="contrast-toggle"
                      className="sr-only peer"
                      checked={isHighContrast}
                      onChange={toggleHighContrast}
                      />
                      <div className="block bg-gray-600 w-14 h-8 rounded-full peer-checked:bg-yellow-400 transition"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
                  </div>
              </label>
            </div>
        </div>

        <div className="mt-6 flex-shrink-0">
          <button onClick={onClose} className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-teal-500 transition-colors">
            Schließen
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SettingsModal;