import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/60 px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5 bg-border/60" />
      {title && (
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </header>
  );
}
