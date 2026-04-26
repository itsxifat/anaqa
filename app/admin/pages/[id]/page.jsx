import { notFound } from 'next/navigation';
import PageEditor from '../PageEditor';
import { getPageById } from '@/actions/pages';

export default async function EditPageAdminPage({ params }) {
  const { id } = await params;
  const data = await getPageById(id);
  if (!data) notFound();

  return <PageEditor id={id} initialData={data} />;
}
