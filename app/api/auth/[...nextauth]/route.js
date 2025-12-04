import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    // 1. Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // 2. Custom Email/Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error("No user found with this email.");
        if (!user.isVerified) throw new Error("Please verify your email first.");
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password.");

        return { id: user._id, name: user.name, email: user.email };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // Auto-register Google User (Auto Verified)
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: 'google',
            isVerified: true
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Custom login page
  }
});

export { handler as GET, handler as POST };