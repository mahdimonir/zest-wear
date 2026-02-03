import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
