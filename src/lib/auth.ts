import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createOrUpdateUser } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        if (user.id && user.email) {
          await createOrUpdateUser(user.id, user.email, user.name || undefined);
        }
      } catch (err) {
        console.error('Error syncing user to database:', err);
      }
      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});
