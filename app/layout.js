import './globals.css';
import { CartProvider } from '@/lib/context/CartContext';
import SessionProvider from '@/components/SessionProvider';
import FooterWrapper from '@/components/FooterWrapper';
import { Toaster } from 'react-hot-toast';
import { getFooterPages } from '@/actions/pages';

export const metadata = {
  title: 'ANAQA',
  description: 'Premium Fashion Store',
};

export default async function RootLayout({ children }) {
  const footerPages = await getFooterPages();

  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <CartProvider>
            <Toaster position="top-right" reverseOrder={false} />
            {/* Each page renders its own <Navbar navData={...}> — no shared Navbar here
                so there is exactly ONE scroll listener per page, not two. */}
            {children}
            <FooterWrapper footerPages={footerPages} />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
