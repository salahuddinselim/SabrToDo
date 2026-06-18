import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createOrUpdateUser } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
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
          await createOrUpdateUser(user.id, user.email, user.name || undefined);
        }
      } catch (err) {
        console.error('Error syncing user to database:', err);
      }
      return true;
    },
    jwt({ token, profile }) {
      if (profile) {
        token.image = profile.picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});
