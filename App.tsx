import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Game, AnimationState } from './types';
import GameSelectionScreen from './components/GameSelectionScreen';
import SplashScreen from './components/SplashScreen';
import CookieBanner from './components/CookieBanner';
import { usePrivacyConsent } from './components/PrivacyConsentContext';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import ImpressumModal from './components/ImpressumModal';
import ReleaseNotesModal from './components/ReleaseNotesModal';
import FeedbackModal from './components/FeedbackModal';
import { RELEASE_NOTES, CURRENT_VERSION } from './releaseNotes';
import SettingsModal from './components/SettingsModal';
import { useSettings } from './components/SettingsContext';
import { useNotification } from './components/Notification';

// This component handles the Service Worker registration based on consent.
const ServiceWorkerRegistrar: React.FC = () => {
    const { consentGiven } = usePrivacyConsent();

    useEffect(() => {
        if (consentGiven && 'serviceWorker' in navigator) {
            const registerServiceWorker = () => {
                const swUrl = `/Party-Games/sw.js`;
                navigator.serviceWorker.register(swUrl).then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.error('ServiceWorker registration failed: ', err);
                });
            };

            // If the page has already loaded, register the service worker immediately.
            // Otherwise, wait for the 'load' event. This prevents a race condition
            // where consent is given after the 'load' event has already fired.
            if (document.readyState === 'complete') {
                registerServiceWorker();
            } else {
                window.addEventListener('load', registerServiceWorker);
            }
        }
    }, [consentGiven]);

    return null; // This component does not render anything.
};

const App: React.FC = () => {
    // Splash screen state
    const [isSplashVisible, setIsSplashVisible] = useState(true);

    // Cookie banner state
    const [showCookieBanner, setShowCookieBanner] = useState(false);
    const { consentGiven } = usePrivacyConsent();
    const { addNotification } = useNotification();

    // Settings context
    const { isHighContrast } = useSettings();

    // Effect to apply high contrast class on initial load
    useEffect(() => {
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [isHighContrast]);

    // Existing state
    const [gameToPlay, setGameToPlay] = useState<Game | null>(null);
    const [selectedGameForAnimation, setSelectedGameForAnimation] = useState<Game | null>(null);
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const [initialCardRect, setInitialCardRect] = useState<DOMRect | null>(null);
    const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);
    const [historyStatePushed, setHistoryStatePushed] = useState(false);


    // Modal state
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isImpressumModalOpen, setIsImpressumModalOpen] = useState(false);
    const [isReleaseNotesModalOpen, setIsReleaseNotesModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const releaseNotesShownThisSession = useRef(false);
    const prevConsentGivenRef = useRef(consentGiven); // Ref to track previous consent state
    
    // Splash screen and cookie banner timer
    useEffect(() => {
        const splashTimer = setTimeout(() => {
            setIsSplashVisible(false);
        }, 2500); // Splash screen starts fading after 2.5s

        const consent = consentGiven;
        if (!consent) {
             setTimeout(() => {
                setShowCookieBanner(true);
            }, 3000); // Show banner after splash screen fades
        }

        return () => clearTimeout(splashTimer);
    }, [consentGiven]);

     // Release notes modal logic
    useEffect(() => {
        const wasConsentJustGiven = !prevConsentGivenRef.current && consentGiven;
        prevConsentGivenRef.current = consentGiven;

        const checkAndShowReleaseNotes = () => {
            if (releaseNotesShownThisSession.current) {
                return; // Prevent modal from showing more than once per session
            }

            // We must have consent to check localStorage
            if (consentGiven) {
                try {
                    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
                    if (lastSeenVersion !== CURRENT_VERSION) {
                        setIsReleaseNotesModalOpen(true);
                        releaseNotesShownThisSession.current = true;
                        localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
                    }
                } catch (e) {
                    console.error("Could not access localStorage for release notes:", e);
                    // We don't notify the user here as it's not a critical function.
                }
            }
        };
        
        let timerId: number | undefined;

        if (wasConsentJustGiven) {
            // If consent was just granted, show the modal immediately without delay.
            checkAndShowReleaseNotes();
        } else if (consentGiven) {
            // If consent was already given on page load, show after a delay (to allow splash screen to pass).
            timerId = window.setTimeout(checkAndShowReleaseNotes, 3200);
        }
        
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [consentGiven]);


    const handleSelectGame = useCallback((game: Game, element: HTMLElement | null) => {
        if (game.id.startsWith('coming-soon') || !element) return;
        
        let pushedSuccessfully = false;
        try {
            // Push a state to history when entering a game to handle the back button
            history.pushState({ inGame: true }, '', location.pathname);
            pushedSuccessfully = true;
        } catch (e) {
            console.warn("Could not push state to history. Using fallback for back navigation.", e);
        }
        setHistoryStatePushed(pushedSuccessfully);

        setSelectedGameForAnimation(game);
        setInitialCardRect(element.getBoundingClientRect());
        setGameToPlay(game);
        setAnimationState('pre-in');
    }, []);

    const ANIMATION_DURATION_MS = 700;

    // Listen for browser back button/gesture
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // If a game is active, the back button should close it, not the app.
            if (gameToPlay) {
                if (selectedGameForAnimation) {
                    setHiddenCardId(selectedGameForAnimation.id);
                }
                setAnimationState('out');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [gameToPlay, selectedGameForAnimation]);

    useEffect(() => {
        if (animationState === 'pre-in') {
            const timerId = setTimeout(() => {
                setAnimationState('in');
            }, 10); 
            return () => clearTimeout(timerId);
        }
    }, [animationState]);

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
        if (e.propertyName !== 'transform') return;

        if (animationState === 'in') {
            setAnimationState('active');
        } else if (animationState === 'out') {
            // Fix flicker on return:
            // 1. Make the static card in the deck visible again.
            //    React will re-render, placing the static card underneath the animated one.
            setHiddenCardId(null);
            
            // 2. Use a short timeout before removing the animated card.
            //    This creates a "buffered swap", giving the browser a frame or two
            //    to render the static card, ensuring there's no moment where neither
            //    card is visible.
            setTimeout(() => {
                setGameToPlay(null);
                setSelectedGameForAnimation(null);
                setInitialCardRect(null);
                setAnimationState('idle');
                setHistoryStatePushed(false);
            }, 50); // 50ms is imperceptible but enough to prevent the race condition.
        }
    };

    const renderGameComponent = () => {
        if (!gameToPlay) return null;
        const GameComponent = gameToPlay.component;

        const onExitRequest = () => {
            if (historyStatePushed) {
                history.back();
            } else {
                // Fallback behavior if pushState failed (e.g., in sandboxed environments)
                if (selectedGameForAnimation) {
                    setHiddenCardId(selectedGameForAnimation.id);
                }
                setAnimationState('out');
            }
        };
        
        return typeof GameComponent === 'function' ? <GameComponent onExit={onExitRequest} /> : null;
    };
    
    const isCardVisible = selectedGameForAnimation && animationState !== 'idle';

    const getSelectionScreenClasses = () => {
        const isGameVisibleOrAnimatingIn = animationState === 'pre-in' || animationState === 'in' || animationState === 'active';
        return `w-full h-full transition-opacity duration-700 ease-in-out ${isGameVisibleOrAnimatingIn ? 'opacity-0 pointer-events-none' : 'opacity-100'}`;
    };


    const getCardStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            transformStyle: 'preserve-3d',
            position: 'absolute',
            zIndex: 30,
        };
        const transitionStyle: React.CSSProperties = {
            transition: `all ${ANIMATION_DURATION_MS}ms ease-in-out`,
        };

        if (animationState === 'pre-in' && initialCardRect) {
            return {
                ...baseStyle,
                width: `${initialCardRect.width}px`,
                height: `${initialCardRect.height}px`,
                top: `${initialCardRect.top}px`,
                left: `${initialCardRect.left}px`,
                borderRadius: '1rem',
                transform: 'rotateY(0deg)',
                transition: 'none',
            };
        }
        
        if (animationState === 'in' || animationState === 'active') {
            return {
                ...baseStyle,
                ...transitionStyle,
                width: '100vw',
                height: '100vh',
                top: '0px',
                left: '0px',
                borderRadius: '0px',
                transform: 'rotateY(180deg)',
            };
        }

        if (animationState === 'out' && initialCardRect) {
             return {
                ...baseStyle,
                ...transitionStyle,
                width: `${initialCardRect.width}px`,
                height: `${initialCardRect.height}px`,
                top: `${initialCardRect.top}px`,
                left: `${initialCardRect.left}px`,
                borderRadius: '1rem',
                transform: 'rotateY(0deg)',
            };
        }
        
        return { display: 'none' };
    };
    
    const foreignObjectDivProps: any = {
        xmlns: "http://www.w3.org/1999/xhtml",
        className: "w-full h-full p-6 flex flex-col justify-between text-left",
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gray-900 perspective">
            <ServiceWorkerRegistrar />
            <ReleaseNotesModal isOpen={isReleaseNotesModalOpen} onClose={() => setIsReleaseNotesModalOpen(false)} releaseNotes={RELEASE_NOTES} />
            {showCookieBanner && <CookieBanner 
                                    onBannerClose={() => setShowCookieBanner(false)}
                                    onShowPrivacyModal={() => setIsPrivacyModalOpen(true)}
                                    onShowImpressumModal={() => setIsImpressumModalOpen(true)}
                                />}
            <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
            <ImpressumModal isOpen={isImpressumModalOpen} onClose={() => setIsImpressumModalOpen(false)} />
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
            
            <div className={`w-full h-full transition-opacity duration-700 ease-in-out ${!isSplashVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`w-full h-full ${getSelectionScreenClasses()}`}>
                    <GameSelectionScreen 
                      onSelectGame={handleSelectGame} 
                      hiddenCardId={hiddenCardId} 
                      appAnimationState={animationState}
                      onShowPrivacyModal={() => setIsPrivacyModalOpen(true)}
                      onShowImpressumModal={() => setIsImpressumModalOpen(true)}
                      onShowReleaseNotes={() => setIsReleaseNotesModalOpen(true)}
                      onShowFeedbackModal={() => setIsFeedbackModalOpen(true)}
                      onShowSettingsModal={() => setIsSettingsModalOpen(true)}
                    />
                </div>

                {isCardVisible && selectedGameForAnimation && (
                    <div
                        onTransitionEnd={handleTransitionEnd}
                        style={getCardStyle()}
                    >
                        <div className={`absolute w-full h-full rounded-[inherit] shadow-2xl bg-gradient-to-br ${selectedGameForAnimation.colorGradient} backface-hidden`}>
                            <svg width="100%" height="100%" viewBox="0 0 288 384" preserveAspectRatio="xMidYMid meet">
                                <foreignObject x="0" y="0" width="288" height="384">
                                    <div {...foreignObjectDivProps}>
                                        <div>
                                            <p className="font-bold text-gray-900/50 uppercase tracking-wider text-sm high-contrast-text-black">{selectedGameForAnimation.tagline}</p>
                                            <h2 className="text-3xl font-black text-white high-contrast-text-black leading-tight">{selectedGameForAnimation.title}</h2>
                                        </div>
                                        <div>
                                            <p className="text-white/80 high-contrast-text-black text-lg">{selectedGameForAnimation.description}</p>
                                            <div className="flex items-center justify-between gap-2 mt-4 text-white/90 high-contrast-text-black">
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                                    </svg>
                                                    <p className="font-semibold text-base">{selectedGameForAnimation.minPlayers} - {selectedGameForAnimation.maxPlayers} Spieler</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </foreignObject>
                            </svg>
                        </div>
                        
                        <div className="absolute w-full h-full rounded-[inherit] bg-gray-900 rotate-y-180 backface-hidden overflow-auto">
                            {renderGameComponent()}
                        </div>
                    </div>
                )}
            </div>

            <SplashScreen isVisible={isSplashVisible} />
        </div>
    );
};

export default App;