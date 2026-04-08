import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCurrentUserProfile } from '@/lib/auth/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserProfile();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          userFullName={user?.fullName ?? null}
          userEmail={user?.email ?? null}
          userAvatarUrl={user?.avatarUrl ?? null}
        />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
