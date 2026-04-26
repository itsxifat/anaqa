'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper({ footerPages = [] }) {
  const pathname = usePathname();
  const hiddenPaths = ['/admin', '/login', '/signup', '/verify'];
  if (hiddenPaths.some(p => pathname?.startsWith(p))) return null;
  return <Footer footerPages={footerPages} />;
}
