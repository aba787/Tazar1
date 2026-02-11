import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/actions/admin';
import AdminSidebar from './components/AdminSidebar';

export const metadata = {
  title: 'لوحة الإدارة | تآزر',
  description: 'لوحة إدارة منصة تآزر الصناعية',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdminUser = await isAdmin();

  if (!isAdminUser) {
    redirect('/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
