export const APP_NAME = "Plateau";
export const APP_DESCRIPTION =
  "Le plateau des métiers du cinéma et de l'audiovisuel au Maroc";

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Nador",
  "Mohammedia",
  "El Jadida",
  "Béni Mellal",
  "Ouarzazate",
  "Essaouira",
  "Laâyoune",
  "Dakhla",
  "Taza",
  "Settat",
  "Khouribga",
  "Safi",
  "Errachidia",
] as const;

export const MOROCCAN_REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "L'Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab",
] as const;

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  STUDENT: "Étudiant",
  JUNIOR: "Junior (0-3 ans)",
  INTERMEDIATE: "Intermédiaire (3-7 ans)",
  SENIOR: "Senior (7-15 ans)",
  EXPERT: "Expert (15+ ans)",
};

export const AVAILABILITY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  BUSY: "Occupé",
  UNAVAILABLE: "Indisponible",
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  VERIFIED: "Vérifié",
  REJECTED: "Rejeté",
  SUSPENDED: "Suspendu",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MODERATOR: "Modérateur",
  PROFESSIONAL: "Professionnel",
  RECRUITER: "Recruteur / Production",
  INSTITUTION: "Institution",
};

export const ITEMS_PER_PAGE = 20;
