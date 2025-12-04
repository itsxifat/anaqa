import { 
  Playfair_Display, Manrope, Great_Vibes, Montserrat, Lato, Cinzel, 
  Cormorant_Garamond, Dancing_Script, Prata, Italiana, Tenor_Sans, Bodoni_Moda 
} from 'next/font/google';
import "./globals.css";
import AuthProvider from "./AuthProvider"; // Import the provider

// ... (Keep all your font configurations exactly as they are) ...
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
// ... (rest of fonts) ...
const bodoni = Bodoni_Moda({ subsets: ['latin'], variable: '--font-bodoni' });

export const metadata = {
  title: 'ANAQA | Luxury Fashion',
  description: 'Ultra modern women fashion brand',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`
        ${playfair.variable} ${manrope.variable} 
        antialiased font-manrope bg-white text-black
      `}>
        {/* Wrap children with AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}