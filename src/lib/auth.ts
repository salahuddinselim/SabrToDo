import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { randomUUID } from 'crypto';
import { getAllRows, appendRow, updateRowByColumn } from '@/lib/sheets';
import { createCSRFToken } from '@/lib/csrf';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 86400,
    updateAge: 3600,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  },
  providers: [
    Google({
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (user.id && user.email) {
          const users = await getAllRows('users');
          const existing = users.find((u) => u.firebase_uid === user.id);
          if (existing) {
            await updateRowByColumn('users', 'firebase_uid', user.id, {
              ...existing,
              email: user.email,
              display_name: user.name || existing.display_name || '',
              updated_at: new Date().toISOString(),
            });
          } else {
            await appendRow('users', {
              id: randomUUID(),
              firebase_uid: user.id,
              email: user.email,
              display_name: user.name || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Error syncing user to database:', err);
      }
      return true;
    },
    jwt({ token, profile, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (profile) {
        token.image = profile.picture;
        token.email = profile.email;
      }
      if (!token.csrfToken) {
        token.csrfToken = createCSRFToken(token.sub || '');
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.image = token.image as string;
        session.csrfToken = token.csrfToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});

declare module 'next-auth' {
  interface Session {
    csrfToken?: string;
  }
}
