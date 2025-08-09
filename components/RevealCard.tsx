
import React, { useState, useRef, useLayoutEffect } from 'react';

interface RevealCardProps {
  content: string;
  isImpostor: boolean;
  onRevealed: () => void;
  impostorHintEnabled?: boolean;
  theme?: string;
}

const RevealCard: React.FC<RevealCardProps> = ({ content, isImpostor, onRevealed, impostorHintEnabled, theme }) => {
  const [yPos, setYPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const contentRef = useRef<HTMLHeadingElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  
  const REVEAL_THRESHOLD = -100;
  
  // Dynamische maximale Ziehdistanz
  const [maxDragDistance, setMaxDragDistance] = useState(-360);

  useLayoutEffect(() => {
    if (cardRef.current) {
        // Lässt einen kleinen Teil der Karte am unteren Rand sichtbar
        const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const visiblePart = -12 // -12px bei 16px root
        setMaxDragDistance(-(cardRef.current.clientHeight - visiblePart));
    }
  }, []);


  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startY.current = clientY - yPos;
    if (cardRef.current) {
        cardRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    let newY = clientY - startY.current;
    
    newY = Math.min(0, Math.max(newY, maxDragDistance)); 
    setYPos(newY);

    if (newY < REVEAL_THRESHOLD && !hasBeenRevealed) {
        setHasBeenRevealed(true);
        onRevealed();
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease-out';
    }
    setYPos(0);
  };

  useLayoutEffect(() => {
    const textElement = contentRef.current;
    const containerElement = contentContainerRef.current;

    if (!textElement || !containerElement) return;

    // Setzt die Schriftgröße zurück, um eine genaue Überlaufmessung zu erhalten
    textElement.style.fontSize = ''; 
    const initialFontSize = parseFloat(getComputedStyle(textElement).fontSize);
    
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);

    const isOverflowing = () =>
      textElement.scrollWidth > containerElement.clientWidth ||
      textElement.scrollHeight > containerElement.clientHeight;

    if (isOverflowing()) {
      // Berechnet den Skalierungsfaktor
      const widthRatio = containerElement.clientWidth / textElement.scrollWidth;
      const heightRatio = containerElement.clientHeight / textElement.scrollHeight;
      const ratio = Math.min(widthRatio, heightRatio, 1);

      // Wendet die neue Schriftgröße an, mit einer Mindestgröße für die Lesbarkeit
      const newSize = Math.floor(initialFontSize * ratio);
      textElement.style.fontSize = `${Math.max(newSize, remInPx)}px`; // Mindestens 1rem
    }
  }, [content]);

  return (
    <div 
        className="relative w-72 h-96 rounded-2xl select-none tap-highlight-transparent"
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
    >
      {/* Hintergrund, der das Wort/die Rolle anzeigt. */}
      <div className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-4 text-center ${isImpostor ? 'bg-red-800' : 'bg-blue-800'}`}>
         <p className="text-gray-300 text-sm shrink-0">{isImpostor ? 'Deine Rolle:' : 'Euer Begriff:'}</p>
         
         <div ref={contentContainerRef} className="w-full flex-grow flex flex-col items-center justify-center my-2">
            <h2 ref={contentRef} className={`font-black text-4xl leading-tight ${isImpostor ? 'text-red-200' : 'text-blue-200'}`}>{content}</h2>
            {isImpostor && impostorHintEnabled && theme && (
              <div className="mt-4 bg-red-900/50 rounded-lg px-4 py-2 ring-1 ring-red-700/50">
                  <p className="text-xs text-red-200 font-bold uppercase tracking-wider">Hinweis (Kategorie)</p>
                  <p className="text-lg text-red-100 font-semibold">{theme}</p>
              </div>
            )}
         </div>
         
         <div className="shrink-0">
            {isImpostor ? (
              <p className="text-sm text-red-300 max-w-xs">Dein Ziel: Bleib unentdeckt! Höre den anderen gut zu, um das geheime Wort zu erraten und bluffe geschickt mit.</p>
            ) : (
              <p className="text-sm text-blue-300">Beschreibe diesen Begriff, ohne ihn zu nennen.</p>
            )}
         </div>
      </div>

      {/* Die ziehbare obere Karte */}
      <div 
        ref={cardRef}
        className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl shadow-2xl flex flex-col items-center justify-center cursor-grab"
        style={{ transform: `translateY(${yPos}px)`}}
      >
        <div className="text-center text-gray-900 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <h3 className="text-2xl font-bold mt-4">Karte hochziehen</h3>
            <p className="mt-1">um deine Rolle zu sehen</p>
        </div>
      </div>
    </div>
  );
};

export default RevealCard;