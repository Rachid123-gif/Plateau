import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserCheck } from "lucide-react";
import { AdminProfileActions } from "./actions";
type PendingProfile = {
  id: string;
  firstName: string;
  lastName: string;
  artistName: string | null;
  city: string | null;
  createdAt: Date;
  verificationStatus: string;
  experienceLevel: string;
  availabilityStatus: string;
  primaryProfession: { name: string } | null;
  user: { email: string };
};

export const metadata = {
  title: "Validation des profils",
};

export const dynamic = "force-dynamic";

export default async function ProfilsAdminPage() {
  const profiles = await prisma.profile.findMany({
    where: { verificationStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      primaryProfession: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          <UserCheck className="h-6 w-6" />
          Profils à valider
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {profiles.length} profil{profiles.length !== 1 ? "s" : ""} en attente de validation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profils en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Aucun profil en attente</p>
              <p className="text-sm mt-1">
                Tous les profils soumis ont été traités.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Date d&apos;inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(profiles as PendingProfile[]).map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.firstName} {profile.lastName}
                      {profile.artistName && (
                        <span className="text-xs text-gray-500 block">
                          &ldquo;{profile.artistName}&rdquo;
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {profile.user.email}
                    </TableCell>
                    <TableCell>
                      {profile.primaryProfession ? (
                        <Badge variant="secondary" className="text-xs">
                          {profile.primaryProfession.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Non renseigné</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {profile.city ?? <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(profile.createdAt), "d MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminProfileActions profileId={profile.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
