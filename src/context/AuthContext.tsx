import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supabase, 
  AppUser, 
  formatSupabaseUser, 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser 
} from '../services/supabase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithGoogleRedirect: () => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<AppUser | null>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<AppUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const cached = localStorage.getItem('supabase_mock_user');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(formatSupabaseUser(session.user));
      } else {
        const cached = localStorage.getItem('supabase_mock_user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {}
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const formatted = formatSupabaseUser(session.user);
        setUser(formatted);
      } else {
        const cached = localStorage.getItem('supabase_mock_user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInGoogle = async () => {
    const res = await signInWithGoogle();
    if (res) {
      setUser(res);
    }
    return res;
  };

  const handleSignInGoogleRedirect = async () => {
    const res = await signInWithGoogle();
    if (res) {
      setUser(res);
    }
    return res;
  };

  const handleLoginEmail = async (email: string, pass: string) => {
    const userResult = await loginWithEmail(email, pass);
    setUser(userResult);
    return userResult;
  };

  const handleRegisterEmail = async (email: string, pass: string, name?: string) => {
    const userResult = await registerWithEmail(email, pass, name);
    setUser(userResult);
    return userResult;
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignInGoogle,
        signInWithGoogleRedirect: handleSignInGoogleRedirect,
        loginWithEmail: handleLoginEmail,
        registerWithEmail: handleRegisterEmail,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
