import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      wallet?: string | null; // Add wallet field here
    };
  }

  interface User {
    wallet?: string | null; // Add wallet field to User
  }

  interface JWT {
    wallet?: string | null; // Add wallet field to JWT
  }
}
