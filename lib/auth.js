import { SignJWT, jwtVerify } from 'jose';
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// --- 1. ADMIN TOKEN LOGIC (Using 'jose' for Edge compatibility) ---
const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'unsafe-secret-change-me');

export async function signAdminToken() {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'admin';
  } catch (err) {
    return false;
  }
}

// --- 2. NEXT-AUTH CONFIGURATION (Required for getServerSession) ---
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          image: user.image, 
          role: user.role 
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "unsafe-secret-change-me",
};