import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        try {
          const message = credentials.message || "{}";
          const signature = String(credentials.signature) || "";
          const siwe = new SiweMessage(message);
          const result = await siwe.verify({ signature });
          // Return an object with properties that match what you use in the callbacks
          return { wallet: result.data.address, name: "" };
        } catch (e) {
          console.log(e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.wallet = user.wallet;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.wallet) {
        session.user.name = token.name || "";
        session.user.wallet = String(token.wallet) || "";
      }
      return session;
    },
  },

  trustHost: true,
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
} satisfies NextAuthConfig;

export const { handlers, auth, signOut, signIn } = NextAuth(authConfig);
