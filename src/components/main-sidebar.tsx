'use client';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import {
  LayoutDashboard,
  CalendarDays,
  LineChart,
  User,
  Sparkles,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/ai-predictions', label: 'AI Predictions', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold font-headline">Gym Journey</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href} passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                  <a>
                    <Icon />
                    <span>{label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings" passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings">
                  <a>
                    <Settings />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
