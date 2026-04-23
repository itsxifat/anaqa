import PageEditor from '../PageEditor';
import { getPageContent } from '@/actions/pages';

export default async function AdminAboutPage() {
  const data = await getPageContent('about');
  return (
    <PageEditor
      slug="about"
      initialData={data}
      title="About Us"
      subtitle="Manage the About Us page content"
    />
  );
}
