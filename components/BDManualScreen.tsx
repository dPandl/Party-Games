import React from 'react';
import { MANUAL_CONTENT } from '../games/bombenentschaerfungData';

interface BDManualScreenProps {
  onExit: () => void;
}

const BDManualScreen: React.FC<BDManualScreenProps> = ({ onExit }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 z-40 font-mono text-white flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-black/30 border-b-2 border-red-500/50">
        <h1 className="text-2xl font-black text-red-400">Handbuch</h1>
        <button onClick={onExit} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md font-bold text-yellow-300">
          Schließen
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-4" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '1rem 1rem'}}>
        <div className="max-w-4xl mx-auto space-y-8 text-base">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <b className="text-lg">Seriennummer & Batterien:</b>
            <p className="text-gray-400">Die Seriennummer und die Anzahl der Batterien können für einige Module wichtig sein! Der Techniker sollte sie bei Bedarf durchgeben.</p>
          </div>
          
          {/* Wires Section */}
          <div>
              <h2 className="text-2xl font-bold text-yellow-400 border-b border-yellow-400/50 mb-3 pb-2">{MANUAL_CONTENT.wires.title}</h2>
              <ul className="space-y-3 list-disc list-inside text-gray-300">
                  {MANUAL_CONTENT.wires.rules.map((r, i) => <li key={i}><b className="text-white">{r.cond}</b> {r.val}</li>)}
              </ul>
          </div>

          {/* Button Section */}
          <div>
              <h2 className="text-2xl font-bold text-yellow-400 border-b border-yellow-400/50 mb-3 pb-2">{MANUAL_CONTENT.button.title}</h2>
              <p className="mb-3 text-gray-300">{MANUAL_CONTENT.button.rules.join(' ')}</p>
              <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                <b className="text-white">Gedrückt halten & Streifenfarben:</b> 
                <p className="text-gray-300">{MANUAL_CONTENT.button.strip.join(' ')}</p>
              </div>
          </div>
          
          {/* Keypad Section */}
          <div>
              <h2 className="text-2xl font-bold text-yellow-400 border-b border-yellow-400/50 mb-3 pb-2">{MANUAL_CONTENT.keypad.title}</h2>
              <div>
                  <p className="mb-4 text-gray-300">{MANUAL_CONTENT.keypad.instructions}</p>
                  <div className="flex justify-around bg-gray-800 p-4 rounded-lg border border-gray-700">
                      {MANUAL_CONTENT.keypad.columns.map((col, i) => (
                          <div key={i} className="flex flex-col items-center space-y-2 text-2xl">
                              {col.map(s => <span key={s}>{s}</span>)}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Simon Says Section */}
          <div>
              <h2 className="text-2xl font-bold text-yellow-400 border-b border-yellow-400/50 mb-3 pb-2">{MANUAL_CONTENT.simonSays.title}</h2>
              <ul className="space-y-3 list-disc list-inside text-gray-300">
                  {MANUAL_CONTENT.simonSays.rules.map((r, i) => <li key={i}><b className="text-white">{r.cond}</b> {r.val}</li>)}
              </ul>
          </div>

          <div className="h-8"></div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BDManualScreen;
