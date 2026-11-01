// hooks/useDebounce.js – Experiment 2: Custom hook that delays a value update
// Used on the donor search city input to avoid firing an API call on every keystroke
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Cleanup: cancel the timer if value changes before delay elapses
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
