import React from 'react';

interface ImpressumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImpressumModal: React.FC<ImpressumModalProps> = ({ isOpen, onClose }) => {
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
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-teal-400">Impressum</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="text-gray-300 space-y-4 overflow-y-auto pr-2">
            <h3 className="text-xl font-bold text-teal-300 pt-2">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h3>
            <p>Pascal Pander</p>
            <p>Bahnhofstraße 39</p>
            <p>78532 Tuttlingen</p>
            
            <h3 className="text-xl font-bold text-teal-300 pt-2">Kontakt</h3>
            <p>E-Mail: pascalpander@by-dp.de</p>

            <h3 className="text-xl font-bold text-teal-300 pt-2">Haftungsausschluss</h3>
            <p className="font-semibold text-gray-200">Haftung für Inhalte</p>
            <p>Als Diensteanbieter bin ich für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Ich bin jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.</p>

            <p className="font-semibold text-gray-200 mt-2">Haftung für Links</p>
            <p>Mein Angebot enthält Links zu externen Websites Dritter (insbesondere zu einem Google Site für den Austausch von Spielinhalten), auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend entfernen.</p>

            <p className="font-semibold text-gray-200 mt-2">Urheberrecht</p>
            <p>Die von mir erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
            
            <p className="mt-4 text-sm text-gray-500">Dieses Impressum wurde mit Hilfe von Vorlagen erstellt und an den privaten, nicht-kommerziellen Charakter dieser Web-Anwendung angepasst.</p>
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

export default ImpressumModal;