// hooks/useSocket.js – Experiment 8: Real-time communication via WebSockets
// Connects to socket.io when the user is logged in; joins blood-group rooms automatically
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : '';

export function useSocket() {
  const { token } = useAuth();
  const { addNotification } = useNotifications();
  const socketRef = useRef(null);

  // useEffect: connect socket on login, clean up on logout
  useEffect(() => {
    if (!token) return; // not logged in

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // New blood request matching donor's group
    socket.on('request:new', payload => {
      const msg = `🩸 New ${payload.bloodGroup} request in ${payload.city} (${payload.urgency})`;
      toast(msg, { icon: '🏥' });
      addNotification({ type: 'request:new', message: msg, payload });
    });

    // Donor responded to hospital's request
    socket.on('request:response', payload => {
      const msg = `✅ ${payload.donorName} (${payload.bloodGroup}) can donate!`;
      toast.success(msg);
      addNotification({ type: 'request:response', message: msg, payload });
    });

    socket.on('connect_error', err => {
      console.warn('Socket error:', err.message);
    });

    // Cleanup: disconnect when component unmounts or user logs out
    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef;
}
