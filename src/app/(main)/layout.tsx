import { BottomNav } from '@/components/bottom-nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background/95">
      <main className="p-4 sm:p-6 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
