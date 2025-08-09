import React, { useMemo } from 'react';

interface SplashScreenProps {
  isVisible: boolean;
}

const ConfettiPiece: React.FC<{ style: React.CSSProperties, color: string }> = ({ style, color }) => (
    <div className={`confetti-piece absolute w-2 h-4 rounded-sm ${color}`} style={style}></div>
);

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
    const confetti = useMemo(() => {
        const pieces = [];
        const colors = ['bg-teal-400', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-400', 'bg-orange-500'];
        for (let i = 0; i < 150; i++) {
            pieces.push({
                style: {
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 3 + 2}s`, // 2-5 seconds
                    animationDelay: `${Math.random() * 2}s`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                },
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        return pieces;
    }, []);

    return (
        <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 overflow-hidden">
                {confetti.map((piece, i) => (
                    <ConfettiPiece key={i} style={piece.style} color={piece.color} />
                ))}
            </div>
            <div className="text-center animate-fade-in-scale">
                 <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-teal-400 via-purple-500 to-pink-500 splash-gradient">
                    Party Games
                </h1>
                <p className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-teal-400 via-purple-500 to-pink-500 splash-gradient mt-4">by dP</p>
            </div>
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .confetti-piece {
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    top: -10vh; /* Start above screen */
                }
                @keyframes fade-in-scale {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;