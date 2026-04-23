import PageEditor from '../PageEditor';
import { getPageContent } from '@/actions/pages';

export default async function AdminPrivacyPage() {
  const data = await getPageContent('privacy');
  return (
    <PageEditor
      slug="privacy"
      initialData={data}
      title="Privacy Policy"
      subtitle="Manage the Privacy Policy page"
    />
  );
}
