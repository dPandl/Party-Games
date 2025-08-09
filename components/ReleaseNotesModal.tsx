import React, { useState } from 'react';
import { ReleaseNote } from '../releaseNotes';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseNotes: ReleaseNote[];
}

const ReleaseNoteItem: React.FC<{ note: ReleaseNote, isLatest: boolean }> = ({ note, isLatest }) => {
  const hasContent = note.whatsNew.length > 0 || note.bugFixes.length > 0 || note.adjustments.length > 0;

  const renderList = (items: (string | string[])[]) => (
    <ul className="list-disc list-inside pl-2 space-y-1">
      {items.map((item, i) => {
        if (Array.isArray(item)) {
          // Wickelt die Unterliste in ein `li`, um valides HTML zu erstellen.
          // Das übergeordnete `li` hat keinen Aufzählungspunkt, und die innere `ul` erhält ihre eigenen Punkte und Einrückungen.
          return (
            <li key={i} className="list-none">
              <ul className="list-disc list-inside pl-4 space-y-1 mt-1">
                {item.map((subItem, j) => <li key={`${i}-${j}`}>{subItem}</li>)}
              </ul>
            </li>
          );
        }
        return <li key={i}>{item}</li>;
      })}
    </ul>
  );


  return (
    <div className={`p-4 rounded-lg ${isLatest ? 'bg-gray-700/50 border border-teal-500/30' : 'bg-gray-700/40 border border-gray-700'}`}>
        <div className="flex items-baseline gap-3">
          <h3 className="text-2xl font-bold text-teal-300">{note.version}</h3>
          {note.optionalTitle && <p className="text-gray-400">{note.optionalTitle}</p>}
        </div>
        
        {!hasContent ? (
            <p className="text-gray-400 mt-2">Keine spezifischen Änderungen für diese Version vermerkt.</p>
        ) : (
            <div className="space-y-3 mt-3 text-gray-300">
            {note.whatsNew.length > 0 && (
                <div>
                <h4 className="font-bold text-green-400">✨ Neu</h4>
                {renderList(note.whatsNew)}
                </div>
            )}
            {note.bugFixes.length > 0 && (
                <div>
                <h4 className="font-bold text-orange-400">🐞 Bugfixes</h4>
                {renderList(note.bugFixes)}
                </div>
            )}
            {note.adjustments.length > 0 && (
                <div>
                <h4 className="font-bold text-blue-400">🔧 Anpassungen</h4>
                {renderList(note.adjustments)}
                </div>
            )}
            </div>
        )}
    </div>
  );
};

const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose, releaseNotes }) => {
  if (!isOpen) {
    return null;
  }

  const [showAll, setShowAll] = useState(false);
  const latestNote = releaseNotes[0];
  const notesToShow = showAll ? releaseNotes : [latestNote];

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[30] p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-teal-400">{showAll ? 'Versionsverlauf' : 'Was ist neu?'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-grow space-y-4 overflow-y-auto pr-2">
            {notesToShow.map((note) => (
                <ReleaseNoteItem key={note.version} note={note} isLatest={note.version === latestNote.version} />
            ))}
        </div>

        <div className="mt-6 flex-shrink-0 flex items-center justify-between gap-4">
            <button onClick={() => setShowAll(!showAll)} className="text-teal-400 font-semibold hover:underline">
                {showAll ? 'Nur neueste anzeigen' : 'Alle Versionen anzeigen'}
            </button>
            <button onClick={onClose} className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-teal-500 transition-colors">
                Verstanden
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

export default ReleaseNotesModal;