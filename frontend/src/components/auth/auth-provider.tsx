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
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    const delay = Date.parse(session.expiresAt) - Date.now();
    const timeout = window.setTimeout(
      () => setSession(null),
      Math.max(delay, 0),
    );
    return () => window.clearTimeout(timeout);
  }, [session]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const result = await login(credentials);
    const profile = await getCurrentProfile(result.accessToken);
    setSession({
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      profile,
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      await logout(session.accessToken);
      setSession(null);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        setSession(null);
        return;
      }
      throw error;
    }
  }, [session]);

  const value = useMemo(
    () => ({ session, signIn, signOut }),
    [session, signIn, signOut],
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
