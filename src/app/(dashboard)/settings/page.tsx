import { getOwnerProfile } from '@/lib/auth/server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ProfileContent } from './profile-content';

export default async function SettingsPage() {
  const owner = await getOwnerProfile();
  const fullName = owner?.profile.fullName ?? '';
  const email = owner?.profile.email ?? '';
  const plan = owner?.profile.plan ?? 'starter';
  const subscriptionStatus = owner?.profile.subscriptionStatus ?? null;

  return (
    <>
      <DashboardHeader title="설정" description="계정 및 서비스 설정" />
      <div className="p-6 max-w-2xl mx-auto">
        <ProfileContent
          fullName={fullName}
          email={email}
          plan={plan}
          subscriptionStatus={subscriptionStatus}
        />
      </div>
    </>
  );
}
