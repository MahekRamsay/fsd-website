// context/AuthContext.jsx – Experiment 3: Complex state with Context API + useReducer
// Provides user, token, login(), logout() to the whole app
import { createContext, useContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext(null);

// Reducer keeps auth state predictable and easy to debug
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { token: action.token, user: action.user };
    case 'LOGOUT':
      return { token: null, user: null };
    case 'UPDATE_USER':
      return { ...state, user: action.user };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  // Hydrate from localStorage so the user stays logged in on refresh
  const [state, dispatch] = useReducer(authReducer, {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  });

  // Keep localStorage in sync whenever auth state changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  function login(token, user) {
    dispatch({ type: 'LOGIN', token, user });
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  function updateUser(user) {
    dispatch({ type: 'UPDATE_USER', user });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuth() {
  return useContext(AuthContext);
}
