import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found.");
        
        // Allow unverified users to login if using credentials (optional, based on your logic)
        // if (!user.isVerified) throw new Error("Verify email first.");
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password.");
        return user;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
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
    // --- THIS IS THE FIX ---
    // This runs every time the user loads a page. 
    // We force it to check the DB for the NEW Name and Image.
    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });
      
      if (dbUser) {
        // OVERWRITE Session data with FRESH Database data
        session.user.name = dbUser.name; // <--- Updates Name immediately
        session.user.phone = dbUser.phone;
        session.user.id = dbUser._id.toString();
        
        // Handle Custom Image vs Google Image
        if (dbUser.customImage && dbUser.customImage.data) {
          // Add timestamp ?t=... to force browser to ignore old cached image
          session.user.image = `/api/user/avatar/${dbUser._id.toString()}?t=${new Date().getTime()}`;
        } else {
          session.user.image = dbUser.image;
        }
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' }
});

export { handler as GET, handler as POST };