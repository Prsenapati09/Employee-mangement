"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthApiError,
  getCurrentProfile,
  login,
  logout,
  type AuthProfile,
  type LoginCredentials,
} from "@/lib/auth-client";

type AuthSession = {
  accessToken: string;
  expiresAt: string;
  profile: AuthProfile;
};

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = "hrmpro-auth-session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let restoredSession: AuthSession | null = null;

      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(stored) as AuthSession;

          if (
            parsed.accessToken &&
            parsed.expiresAt &&
            parsed.profile &&
            Date.parse(parsed.expiresAt) > Date.now()
          ) {
            restoredSession = parsed;
          } else {
            sessionStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }

      setSession(restoredSession);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session) return;

    const delay = Date.parse(session.expiresAt) - Date.now();
    const timeout = window.setTimeout(() => {
      setSession(null);
      sessionStorage.removeItem(STORAGE_KEY);
    }, Math.max(delay, 0));

    return () => window.clearTimeout(timeout);
  }, [session]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const result = await login(credentials);
    const profile = await getCurrentProfile(result.accessToken);
    const newSession: AuthSession = {
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      profile,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const signOut = useCallback(async () => {
    if (!session) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    try {
      await logout(session.accessToken);
      setSession(null);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        setSession(null);
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      throw error;
    }
  }, [session]);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signOut }),
    [session, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
