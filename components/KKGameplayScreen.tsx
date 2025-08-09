import React, { useState, useEffect } from 'react';
import { BlackStory } from '../types';

interface KKGameplayScreenProps {
  story: BlackStory;
  onNextStory: () => void;
  onEndGame: () => void;
}

const KKGameplayScreen: React.FC<KKGameplayScreenProps> = ({ story, onNextStory, onEndGame }) => {
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);

  // Setzt die Sichtbarkeit der Lösung zurück, wenn sich die Geschichte ändert.
  useEffect(() => {
    setIsSolutionVisible(false);
  }, [story.id]);

  const handleReveal = () => setIsSolutionVisible(true);
  const handleNext = () => onNextStory();

  return (
    <div className="flex flex-col items-center h-full bg-slate-900 px-4 py-8 text-center overflow-y-auto">
        <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-black text-slate-300 mb-2">{story.title}</h1>
            <p className="text-sm text-gray-500 mb-6">Der Spielleiter liest das Szenario vor:</p>
            
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 mb-8 border-2 border-slate-700 min-h-[10rem] flex items-center justify-center">
                <p className="text-2xl text-white leading-relaxed">{story.scenario}</p>
            </div>

            <div className="min-h-[16rem]">
                {isSolutionVisible ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-emerald-900/40 rounded-2xl p-6 border border-dashed border-emerald-500">
                             <h3 className="text-lg font-bold text-emerald-300 mb-2 uppercase tracking-wider">Die Lösung</h3>
                             <p className="text-lg text-gray-200 leading-relaxed">{story.solution}</p>
                        </div>
                        <div className="bg-gray-700/60 rounded-2xl p-6 border border-slate-600">
                             <h3 className="text-lg font-bold text-slate-300 mb-2 uppercase tracking-wider">Hinweise für Spielleiter</h3>
                             <p className="text-gray-300 leading-relaxed">{story.details}</p>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                            <button
                                onClick={handleNext}
                                className="w-full bg-gradient-to-r from-slate-500 to-slate-700 text-white font-bold py-3 px-10 rounded-lg text-lg transition-all shadow-lg shadow-slate-500/30 transform hover:scale-105"
                            >
                                Nächster Fall
                            </button>
                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => setIsSolutionVisible(false)}
                                    className="bg-red-800/80 hover:bg-red-700/80 border border-red-500/50 text-white font-bold py-2 px-6 rounded-lg text-base transition-all"
                                >
                                    Lösung verbergen
                                </button>
                                <button
                                    onClick={onEndGame}
                                    className="bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg text-base hover:bg-gray-600 transition-colors"
                                >
                                    Zurück zum Setup
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={handleReveal}
                        className="bg-red-800/80 hover:bg-red-700/80 border-2 border-red-500/50 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all shadow-lg shadow-red-500/20 transform hover:scale-105"
                    >
                        Lösung aufdecken
                    </button>
                )}
            </div>
        </div>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default KKGameplayScreen;