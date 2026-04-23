import PageEditor from '../PageEditor';
import { getPageContent } from '@/actions/pages';

export default async function AdminTermsPage() {
  const data = await getPageContent('terms');
  return (
    <PageEditor
      slug="terms"
      initialData={data}
      title="Terms & Conditions"
      subtitle="Manage the Terms & Conditions page"
    />
  );
}
