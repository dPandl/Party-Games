import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  gradient: string;
  children: React.ReactNode;
  buttonClass?: string;
  headingClass?: string;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  title,
  gradient,
  children,
  buttonClass = 'bg-teal-600 hover:bg-teal-500',
  headingClass = '[&_h3]:text-teal-300',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700 animate-scale-in"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className={`text-3xl font-black bg-clip-text text-transparent ${gradient}`}>{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className={`text-gray-300 space-y-4 overflow-y-auto pr-2 flex-grow ${headingClass}`}>
          {children}
        </div>

        <div className="mt-6 flex-shrink-0">
          <button onClick={onClose} className={`w-full text-white font-bold py-3 rounded-lg text-lg transition-colors ${buttonClass}`}>
            Verstanden
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
        .list-circle { list-style-type: circle; }
      `}</style>
    </div>
  );
};

export default InstructionsModal;
