import { getAllTemplates } from '@/app/actions/get-all-templates';
import { getUserPlan } from '@/app/actions/get-user-plan';
import { CreateWizard } from '@/components/sessions/create-wizard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default async function NewSessionPage() {
  const [allTemplates, plan] = await Promise.all([
    getAllTemplates(),
    getUserPlan(),
  ]);
  const templates = [...allTemplates.system, ...allTemplates.user];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const canImport = plan === 'pro' || plan === 'enterprise';

  return (
    <>
      <DashboardHeader title="새 세션 생성" />
      <div className="p-6">
        <CreateWizard templates={templates} appUrl={appUrl} canImport={canImport} />
      </div>
    </>
  );
}
