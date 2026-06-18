'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function mapSessionUser(session: {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
  csrfToken?: string;
} | null): AuthUser | null {
  if (!session?.user?.id) return null;
  return {
    uid: session.user.id,
    email: session.user.email ?? null,
    displayName: session.user.name ?? null,
    photoURL: session.user.image ?? null,
    csrfToken: session.csrfToken,
  };
}

export function useAuth(): AuthContextType {
  const { data: session, status } = useSession();

  const user = mapSessionUser(session);

  const handleSignIn = async () => {
    await signIn('google', { redirectTo: '/dashboard' });
  };

  const handleSignUp = async () => {
    await signIn('google', { redirectTo: '/dashboard' });
  };

  const handleSignInGoogle = async () => {
    await signIn('google', { redirectTo: '/dashboard' });
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: '/' });
  };

  return {
    user,
    loading: status === 'loading',
    error: null,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInGoogle: handleSignInGoogle,
    logout: handleLogout,
    clearError: () => {},
  };
}
