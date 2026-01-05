import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
