import { getOwnerProfile } from '@/lib/auth/server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { BillingContent } from './billing-content';

export default async function BillingPage() {
  const owner = await getOwnerProfile();
  const plan = owner?.profile.plan ?? 'starter';
  const subscriptionStatus = owner?.profile.subscriptionStatus ?? null;
  const sessionCount = owner?.profile.sessionCountThisMonth ?? 0;
  const currentPeriodEnd = owner?.profile.currentPeriodEnd ?? null;

  return (
    <>
      <DashboardHeader title="결제 관리" description="요금제 및 결제 내역" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <BillingContent
          plan={plan}
          subscriptionStatus={subscriptionStatus}
          sessionCount={sessionCount}
          hasSubscription={!!owner?.profile.polarSubscriptionId}
          currentPeriodEnd={currentPeriodEnd}
          proProductId={process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID}
          unlimitedProductId={process.env.NEXT_PUBLIC_POLAR_UNLIMITED_PRODUCT_ID}
        />
      </div>
    </>
  );
}
