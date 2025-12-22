import './globals.css';
import Navbar from '@/components/Navbar'; // IMPORT NAVBAR DIRECTLY
import { CartProvider } from '@/lib/context/CartContext';
import SessionProvider from '@/components/SessionProvider';

export const metadata = {
  title: 'ANAQA',
  description: 'Premium Fashion Store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <CartProvider>
            
            {/* USE NAVBAR DIRECTLY */}
            <Navbar />
            
            {children}
            
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}