import React, { useState } from 'react';
import { WWPlayer } from '../types';

// SVG Icons for Roles
const RoleIcon: React.FC<{ role: string }> = ({ role }) => {
    const icons: { [key: string]: React.ReactNode } = {
        Werwolf: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
        Dorfbewohner: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        Seherin: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
        Hexe: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
        Jäger: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19c3-3 3-11 0-14 M5 12h11 M12 8l4 4-4 4" />,
        Amor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icons[role]}</svg>
};

const getRoleDetails = (role: string) => {
    switch (role) {
        case 'Werwolf': return { color: 'text-red-300', goal: 'Ziel: Eliminiert alle Dorfbewohner, bis ihr in der Überzahl seid.' };
        case 'Dorfbewohner': return { color: 'text-blue-300', goal: 'Ziel: Findet und eliminiert alle Werwölfe.' };
        case 'Seherin': return { color: 'text-purple-300', goal: 'Ziel: Finde jede Nacht die Identität eines Spielers heraus, um den Dorfbewohnern zu helfen.' };
        case 'Hexe': return { color: 'text-green-300', goal: 'Ziel: Du hast einen Heil- und einen Gifttrank. Setze sie weise ein, um das Dorf zu retten.' };
        case 'Jäger': return { color: 'text-orange-400', goal: 'Ziel: Wenn du stirbst, reißt du einen anderen Spieler deiner Wahl mit in den Tod.' };
        case 'Amor': return { color: 'text-pink-300', goal: 'Ziel: Wähle zu Beginn zwei Spieler, die sich unsterblich verlieben. Dein Ziel ist es, dass dieses Paar überlebt.' };
        default: return { color: 'text-gray-300', goal: '' };
    }
};

interface RevealScreenProps {
  player: WWPlayer;
  onContinue: () => void;
  isLastPlayer: boolean;
}

const WWRoleRevealScreen: React.FC<RevealScreenProps> = ({ player, onContinue, isLastPlayer }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { color, goal } = getRoleDetails(player.role);

  return (
    <div className="flex flex-col items-center justify-between h-full bg-gray-900 p-4 text-center">
        <div className="text-2xl font-bold mt-8">
            Du bist dran, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-red-500">{player.name}</span>!
        </div>

        <div 
            className="w-80 h-96 bg-gray-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-white border border-gray-700 relative overflow-hidden cursor-pointer"
            onClick={() => setIsRevealed(true)}
        >
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${isRevealed ? 'opacity-0' : 'opacity-100'}`}>
                <h3 className="text-2xl font-bold">Tippe zum Aufdecken</h3>
                <p>deiner geheimen Rolle</p>
            </div>

            <div className={`absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6 transition-opacity duration-700 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <div className={color}><RoleIcon role={player.role} /></div>
                <p className="text-sm text-gray-400">Deine Rolle:</p>
                <h2 className={`text-4xl font-black ${color}`}>{player.role}</h2>
                <p className="text-base text-gray-300 leading-snug">{goal}</p>
            </div>
        </div>
      
        <div className="h-20 mb-8">
            {isRevealed && (
            <button
                onClick={onContinue}
                className="bg-gradient-to-r from-indigo-600 to-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 transform hover:scale-105 animate-fade-in"
            >
                {isLastPlayer ? 'Spiel beginnen' : 'Weitergeben'}
            </button>
            )}
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

export default WWRoleRevealScreen;