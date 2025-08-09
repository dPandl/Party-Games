import React, { useState } from 'react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  onRejected: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, onClose, onVerified, onRejected }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleVerify = () => {
    setError('');
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Bitte gib ein gültiges Datum ein.');
      return;
    }

    const today = new Date();
    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      onVerified();
      onClose();
    } else {
      setError('Du musst mindestens 18 Jahre alt sein, um diese Inhalte anzuzeigen.');
      onRejected();
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
        className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md space-y-4 border border-red-500/50 text-center animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-red-400">Altersüberprüfung</h2>
        <p className="text-gray-300">
          Bitte gib dein Geburtsdatum ein, um zu bestätigen, dass du volljährig bist.
        </p>
        
        <div className="flex justify-center space-x-3 pt-2">
            <input type="number" placeholder="TT" value={day} onChange={e => setDay(e.target.value)} className="w-20 bg-gray-700 text-white rounded-md p-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
            <input type="number" placeholder="MM" value={month} onChange={e => setMonth(e.target.value)} className="w-20 bg-gray-700 text-white rounded-md p-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
            <input type="number" placeholder="JJJJ" value={year} onChange={e => setYear(e.target.value)} className="w-28 bg-gray-700 text-white rounded-md p-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-center space-x-4 pt-4">
          <button onClick={onClose} className="px-8 py-3 rounded-md font-semibold text-gray-300 hover:bg-gray-700 transition-colors">
            Abbrechen
          </button>
          <button onClick={handleVerify} className="px-8 py-3 rounded-md font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors">
            Bestätigen
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default AgeVerificationModal;