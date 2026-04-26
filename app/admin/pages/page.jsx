import Link from 'next/link';
import { Plus } from 'lucide-react';
import AdminPageWrapper from '../components/AdminPageWrapper';
import { getAllPages } from '@/actions/pages';
import PagesListClient from './PagesListClient';

export default async function AdminPagesListPage() {
  const pages = await getAllPages();

  return (
    <AdminPageWrapper
      title="Pages"
      subtitle="Manage all website pages"
      actions={
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors rounded-lg"
        >
          <Plus size={14} /> New Page
        </Link>
      }
    >
      <PagesListClient pages={pages} />
    </AdminPageWrapper>
  );
}
