import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { Document } from 'mongoose';

interface UserDocument extends Document {
  _id: string;
  email: string;
  name: string;
  image?: string;
  password?: string;
  providers: string[];
}

interface Credentials {
  email: string;
  password: string;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      await dbConnect();

      try {
        let dbUser = await User.findOne({ email: user.email }) as UserDocument | null;

        if (!dbUser) {
          // Create new user if doesn't exist
          dbUser = await User.create({
            email: user.email,
            name: user.name || profile?.name,
            image: user.image,
            providers: [account?.provider],
            dashboardPreferences: {
              layout: 'default',
              widgets: [
                { type: 'analytics', position: 0, visible: true },
                { type: 'social', position: 1, visible: true },
                { type: 'ads', position: 2, visible: true },
                { type: 'content', position: 3, visible: true },
              ],
            },
          });
        } else {
          // Update existing user's providers if needed
          if (account?.provider && !dbUser.providers.includes(account.provider)) {
            dbUser.providers.push(account.provider);
            await dbUser.save();
          }
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs
      if (url.startsWith("/api/auth/callback")) {
        return url;
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        // Ensure redirect URLs start with the default locale
        const path = url.startsWith("/en") ? url : `/en${url}`;
        return `${baseUrl}${path}`;
      }

      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default fallback
      return `${baseUrl}/en/dashboard/analytics`;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      authorization: {
        params: {
          scope: "email,pages_show_list,pages_read_engagement,ads_read",
        },
      },
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
      authorization: {
        params: {
          scope: "r_liteprofile r_emailaddress w_member_social rw_organization_admin",
        },
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      async authorize(credentials) {
        console.log("Attempting to authorize:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("Missing email or password");
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email }) as UserDocument | null;
          
          if (!user) {
            console.error(`No user found with email: ${credentials.email}`);
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            console.error(`User found but no password set for email: ${credentials.email}`);
            throw new Error("Account not configured for credentials login");
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password as string
          );

          if (!isValid) {
            console.error(`Invalid password for email: ${credentials.email}`);
            throw new Error("Invalid email or password");
          }

          console.log(`Successfully authenticated user: ${credentials.email}`);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
});
