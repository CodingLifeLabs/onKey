'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  LayoutTemplate,
  KeyRound,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserMenu } from '@/components/dashboard/user-menu';

const navItems = [
  { title: '대시보드', href: '/home', icon: LayoutDashboard },
  { title: '세션 관리', href: '/sessions', icon: FileText },
  { title: '템플릿 관리', href: '/templates', icon: LayoutTemplate },
  { title: '분석', href: '/analytics', icon: BarChart3 },
  { title: '결제 관리', href: '/settings/billing', icon: CreditCard },
  { title: '설정', href: '/settings', icon: Settings },
];

interface AppSidebarProps {
  userFullName: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
}

export function AppSidebar({ userFullName, userEmail, userAvatarUrl }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KeyRound className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">OnKey</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
            메뉴
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href ||
                        (pathname.startsWith(item.href + '/') &&
                          !navItems.some(
                            (other) =>
                              other.href !== item.href &&
                              other.href.startsWith(item.href + '/') &&
                              (pathname === other.href || pathname.startsWith(other.href + '/'))
                          ))
                  }
                  className="h-9 rounded-lg text-sm font-medium transition-colors data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                >
                  <Link href={item.href} className="flex items-center gap-3 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <UserMenu
          fullName={userFullName}
          email={userEmail}
          avatarUrl={userAvatarUrl}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
