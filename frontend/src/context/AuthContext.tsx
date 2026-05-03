import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  login: string | null;
  role: string | null;
  isAuthenticated: boolean;
  signin: (login: string, role: string, access: string, refresh: string) => void;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [login, setLogin] = useState<string | null>(
    localStorage.getItem('login')
  );
  const [role, setRole] = useState<string | null>(
    localStorage.getItem('role')
  );

  const signin = (login: string, role: string, access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('login', login);
    localStorage.setItem('role', role);
    setLogin(login);
    setRole(role);
  };

  const signout = () => {
    localStorage.clear();
    setLogin(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      login, role,
      isAuthenticated: !!login,
      signin, signout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);