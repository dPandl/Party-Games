import React, { useState, useCallback, useContext, createContext, ReactNode } from 'react';

interface NotificationMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  exiting?: boolean;
}

interface NotificationContextType {
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'error') => {
    const id = Date.now() + Math.random();
    // Add new notification
    setNotifications(current => [...current, { id, message, type, exiting: false }]);

    // After a delay, trigger the exit animation
    setTimeout(() => {
      setNotifications(current =>
        current.map(n => (n.id === id ? { ...n, exiting: true } : n))
      );
      
      // After the exit animation completes, remove it from the DOM
      setTimeout(() => {
        setNotifications(current => current.filter(n => n.id !== id));
      }, 500); // Must match exit animation duration
    }, 4000); // Time before notification starts to disappear
  }, []);

  const getGlassmorphismClasses = (type: 'success' | 'error' | 'info') => {
      switch (type) {
          case 'success': return 'bg-green-500/20 border-green-400/30 text-green-100';
          case 'error': return 'bg-red-500/20 border-red-400/30 text-red-100';
          case 'info': return 'bg-blue-500/20 border-blue-400/30 text-blue-100';
      }
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse items-center space-y-3 space-y-reverse w-full max-w-sm pointer-events-none p-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-6 py-3 rounded-xl font-semibold shadow-2xl w-auto max-w-full backdrop-blur-md border pointer-events-auto ${
              getGlassmorphismClasses(notification.type)
            } ${
              notification.exiting ? 'animate-slide-out-down' : 'animate-slide-in-up'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Add CSS for animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes slide-in-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes slide-out-down {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }
  .animate-slide-in-up {
    animation: slide-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  .animate-slide-out-down {
    animation: slide-out-down 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
  }
`;
document.head.appendChild(style);
