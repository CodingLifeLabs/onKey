import { getSystemTemplates } from '@/app/actions/get-templates';
import { CreateWizard } from '@/components/sessions/create-wizard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default async function NewSessionPage() {
  const templates = await getSystemTemplates();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <>
      <DashboardHeader title="새 세션 생성" />
      <div className="p-6">
        <CreateWizard templates={templates} appUrl={appUrl} />
      </div>
    </>
  );
}
