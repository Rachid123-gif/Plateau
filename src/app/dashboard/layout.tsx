import { requireAuth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header user={user} />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
