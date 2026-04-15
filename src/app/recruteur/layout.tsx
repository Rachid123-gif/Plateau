import { requireRole } from "@/lib/auth";
import { Header } from "@/components/layout/header";

export default async function RecruteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["RECRUITER", "ADMIN"]);

  const headerUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          photoUrl: user.profile.photoUrl,
          slug: user.profile.slug,
        }
      : null,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={headerUser} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
