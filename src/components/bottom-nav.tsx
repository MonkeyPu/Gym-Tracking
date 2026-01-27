'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, TrendingUp, PlusSquare, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/routine-creator', label: 'Creator', icon: ClipboardList },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/log', label: 'Log', icon: PlusSquare, isCenter: true },
  { href: '/explore', label: 'Records', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors',
                {
                  'text-primary': isActive,
                  '-mt-8': item.isCenter,
                }
              )}
            >
              {item.isCenter ? (
                <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full text-primary-foreground shadow-lg">
                  <Icon size={32} />
                </div>
              ) : (
                <>
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
