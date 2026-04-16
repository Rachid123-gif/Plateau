import { requireAdminOrModerator } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminOrModerator();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50">
          {children}
        </main>
      </div>
    </div>
  );
}
