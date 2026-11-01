// context/NotificationContext.jsx – Experiment 3: Context API for real-time notifications
// Stores the list of incoming socket events so the Navbar badge and dropdown can show them
import { createContext, useContext, useReducer } from 'react';

export const NotificationContext = createContext(null);

function notifReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      // Prepend new notification and cap the list at 20 items
      return [action.notification, ...state].slice(0, 20);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function NotificationProvider({ children }) {
  const [notifications, dispatch] = useReducer(notifReducer, []);

  function addNotification(notification) {
    dispatch({ type: 'ADD', notification: { ...notification, id: Date.now() } });
  }

  function clearNotifications() {
    dispatch({ type: 'CLEAR' });
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
