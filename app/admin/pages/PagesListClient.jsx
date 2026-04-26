'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Eye, EyeOff, Globe } from 'lucide-react';
import { deletePage } from '@/actions/pages';
import { toast } from 'react-hot-toast';

export default function PagesListClient({ pages: initialPages }) {
  const [pages, setPages] = useState(initialPages);
  const [deleting, setDeleting] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (page) => {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setDeleting(page._id);
    startTransition(async () => {
      const result = await deletePage(page._id);
      if (result.success) {
        setPages(prev => prev.filter(p => p._id !== page._id));
        toast.success('Page deleted');
      } else {
        toast.error(result.error || 'Failed to delete');
      }
      setDeleting(null);
    });
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400 text-sm mb-4">No pages yet.</p>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors rounded-lg"
        >
          Create your first page
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-4xl">
      {pages.map(page => (
        <div
          key={page._id}
          className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 hover:border-gray-200 transition-colors"
        >
          {/* Status dot */}
          <div className={`w-2 h-2 rounded-full shrink-0 ${page.isPublished ? 'bg-green-400' : 'bg-gray-300'}`} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate">{page.title}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400 font-mono">/pages/{page.slug}</span>
              {page.showInFooter && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                  {page.footerGroup}
                </span>
              )}
              {!page.isPublished && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/pages/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="View page"
            >
              <Globe size={15} />
            </a>
            <Link
              href={`/admin/pages/${page._id}`}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
              title="Edit page"
            >
              <Pencil size={15} />
            </Link>
            <button
              onClick={() => handleDelete(page)}
              disabled={deleting === page._id}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
              title="Delete page"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
