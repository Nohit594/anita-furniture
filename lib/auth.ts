import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        await connectDB();
        // password has select:false, so request it explicitly
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * On sign-in, upsert the user into MongoDB and grant the admin role
     * if their email matches ADMIN_EMAIL.
     */
    async signIn({ user }) {
      if (!user.email) return false;
      await connectDB();

      const isAdminEmail =
        process.env.ADMIN_EMAIL &&
        user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

      const existing = await User.findOne({ email: user.email });

      if (!existing) {
        await User.create({
          name: user.name || "Customer",
          email: user.email,
          image: user.image,
          role: isAdminEmail ? "admin" : "customer",
          isActive: true,
        });
      } else {
        // keep admin promoted if their email is the configured admin
        if (isAdminEmail && existing.role !== "admin") {
          existing.role = "admin";
          await existing.save();
        }
        // block deactivated users
        if (!existing.isActive) return false;
      }

      return true;
    },

    async jwt({ token, trigger }) {
      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.isActive = dbUser.isActive;
          // Keep name/avatar in sync with the DB so profile edits show up
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      // no-op reference so `trigger` is available for future update handling
      void trigger;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
};
