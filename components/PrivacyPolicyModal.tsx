import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-teal-400">Datenschutzerklärung</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="text-gray-300 space-y-4 overflow-y-auto pr-2">
            <p className="text-sm text-gray-500">Stand: August 2025</p>

            <h3 className="text-xl font-bold text-teal-300 pt-2">1. Wer ist für diese Website verantwortlich?</h3>
            <p>Ich, Pascal Pander, bin der Entwickler und Betreiber dieser Web-App. Du kannst mich unter der folgenden E-Mail erreichen:</p>
            <p className="mt-2">E-Mail: pascalpander@by-dp.de</p>

            <h3 className="text-xl font-bold text-teal-300 pt-2">2. Welche Daten verarbeitet die App auf deinem Gerät?</h3>
            <p>Diese App ist so gebaut, dass sie deine Privatsphäre maximal respektiert. Ich, der Betreiber, sammle oder speichere keine persönlichen Daten von dir auf irgendwelchen Servern – denn ich habe gar keine! Alles, was passiert, passiert nur auf deinem eigenen Gerät (deinem Handy, Tablet oder Computer).</p>
            <p>Die App nutzt dafür folgende Technologien in deinem Browser:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>Local Storage (Lokaler Speicher):</strong> Wenn du zustimmst, speichert die App hier Daten, die auch nach dem Schließen des Browser-Tabs erhalten bleiben. Dies sind:
                    <ul className="list-circle list-inside pl-6">
                        <li>Deine Zustimmung zur Datenspeicherung.</li>
                        <li>Von dir erstellte Spielinhalte (z.B. eigene Kartensets), damit du sie beim nächsten Mal wiederverwenden kannst.</li>
                        <li>Deine App-Einstellungen (z.B. der hohe Kontrastmodus).</li>
                        <li>Die Versionsnummer, die du zuletzt gesehen hast, um dich über Neuigkeiten zu informieren.</li>
                    </ul>
                </li>
                <li>
                    <strong>Session Storage (Sitzungsspeicher):</strong> Hier merkt sich die App Daten nur für die aktuelle Sitzung. Sobald du den Tab schließt, wird alles gelöscht. Das betrifft:
                     <ul className="list-circle list-inside pl-6">
                        <li>Die Spielernamen, die du eingegeben hast, damit du sie nicht bei jedem neuen Spiel in derselben Sitzung erneut eintippen musst.</li>
                    </ul>
                </li>
                 <li>
                    <strong>Service Worker (für Offline-Funktion):</strong> Wenn du zustimmst, installiert die App ein kleines Skript, das die wichtigsten Dateien (Code, Icons) auf deinem Gerät zwischenspeichert.
                    <ul className="list-circle list-inside pl-6">
                        <li><strong>Zweck:</strong> So funktioniert die App auch ohne Internetverbindung und lädt schneller.</li>
                        <li><strong>Wichtig:</strong> Das passiert nur, wenn du deine Zustimmung gibst. Ohne Zustimmung bleibt die App eine normale Webseite.</li>
                    </ul>
                </li>
            </ul>
            <p><strong>Zusammengefasst: Es werden keine Daten an mich oder Dritte gesendet. Alles bleibt bei dir.</strong></p>

            <h3 className="text-xl font-bold text-teal-300 pt-2">3. Warum werden Schriften von Google geladen? (Google Fonts)</h3>
            <p>Damit die App überall gut aussieht, nutze ich Schriftarten von Google Fonts. Wenn du die App öffnest, lädt dein Browser diese Schriftarten. Dabei wird deine IP-Adresse an Google-Server (möglicherweise in den USA) übertragen. Das ist technisch notwendig, um dir die Texte anzeigen zu können.</p>
            <p>Rechtlich stütze ich mich hier auf mein berechtigtes Interesse an einem ansprechenden Design (gemäß Art. 6 Abs. 1 lit. f DSGVO). Wenn du mehr darüber wissen möchtest, findest du hier die Datenschutzerklärung von Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">https://policies.google.com/privacy</a></p>
            
            <h3 className="text-xl font-bold text-teal-300 pt-2">4. Was passiert, wenn du mir Feedback gibst?</h3>
            <p>Um dir eine einfache Möglichkeit zu geben, mir Feedback zu senden, nutze ich ein Formular von Google Forms. Wenn du auf den "Feedback"-Button klickst, wird eine Verbindung zu Google-Servern aufgebaut, um das Formular zu laden.</p>
            <p>Dabei wird deine IP-Adresse an Google übertragen. Alle Daten, die du in das Formular eingibst, gehen direkt an Google und werden dort verarbeitet. Ich sehe nur den Inhalt deines Feedbacks, um die App zu verbessern. Deine Eingaben sind für mich anonym.</p>
            <p>Die rechtliche Grundlage dafür ist deine Einwilligung (gemäß Art. 6 Abs. 1 lit. a DSGVO), die du gibst, indem du aktiv das Feedback-Fenster öffnest.</p>


            <h3 className="text-xl font-bold text-teal-300 pt-2">5. Warum das Ganze und auf welcher rechtlichen Grundlage?</h3>
            <p>Der einzige Zweck der Datenspeicherung auf deinem Gerät ist es, deine Nutzererfahrung zu verbessern. Deine Einstellungen und Kreationen bleiben erhalten und die App funktioniert offline. Die rechtliche Grundlage dafür ist deine Einwilligung (gemäß Art. 6 Abs. 1 lit. a DSGVO), die du über das Cookie-Banner erteilst.</p>

            <h3 className="text-xl font-bold text-teal-300 pt-2">6. Was passiert, wenn du den Set Shop besuchst?</h3>
            <p>Die App enthält einen Link zum "Set Shop", einer externen Website, die ich auf Google Sites erstellt habe, damit du Spielinhalte mit anderen teilen kannst. Wenn du auf diesen Link klickst, verlässt du meine App.</p>
            <p>Bitte beachte, dass ich keinen Einfluss darauf habe, welche Daten Google auf dieser Seite sammelt. Mit dem Klick werden Daten wie deine IP-Adresse an Google übertragen. Für alles, was auf dieser externen Seite passiert, gelten die Datenschutzbestimmungen von Google. Ich empfehle dir, diese bei Interesse zu lesen.</p>

            <h3 className="text-xl font-bold text-teal-300 pt-2">7. Deine Rechte und volle Kontrolle</h3>
            <p>Da alle relevanten Daten nur auf deinem Gerät gespeichert werden, hast du die volle Kontrolle. Du kannst deine Rechte so ausüben:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                    <strong>Auskunft und Berichtigung:</strong> Du kannst die von dir erstellten Sets jederzeit im Setup-Menü des jeweiligen Spiels ansehen und bearbeiten.
                </li>
                <li>
                    <strong>Löschung:</strong> Du kannst alle Daten dieser App löschen, indem du die Browserdaten (Cache, Cookies, Website-Daten) für diese Seite in den Einstellungen deines Browsers löschst. Die Spielernamen werden automatisch gelöscht, wenn du den Tab schließt.
                </li>
                 <li>
                    <strong>Widerruf der Einwilligung:</strong> Du kannst deine Zustimmung jederzeit widerrufen, indem du wie oben beschrieben die Website-Daten in deinem Browser löschst. Beim nächsten Besuch der App frage ich dich dann erneut um Erlaubnis.
                </li>
            </ul>
             <p>Ich verwende keine automatisierten Entscheidungen oder erstelle Profile von dir.</p>
        </div>

        <div className="mt-6 flex-shrink-0">
          <button onClick={onClose} className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-teal-500 transition-colors">
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

export default PrivacyPolicyModal;