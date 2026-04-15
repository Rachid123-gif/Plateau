import type {
  User,
  Profile,
  Profession,
  ProfessionCategory,
  Skill,
  SkillCategory,
  Experience,
  Education,
  PortfolioItem,
  AvailabilitySlot,
  Institution,
  ContactRequest,
  Language,
  ProfileLanguage,
  Notification,
  UserRole,
} from "@prisma/client";

// Profile with all relations loaded
export type ProfileWithRelations = Profile & {
  user: Pick<User, "id" | "email" | "role">;
  primaryProfession: Profession | null;
  professions: { profession: Profession }[];
  skills: { skill: Skill }[];
  experiences: Experience[];
  education: (Education & { institution: Institution | null })[];
  portfolio: PortfolioItem[];
  languages: (ProfileLanguage & { language: Language })[];
  availability: AvailabilitySlot[];
};

// Profile card (for search results / directory)
export type ProfileCard = Profile & {
  primaryProfession: Profession | null;
  skills: { skill: Pick<Skill, "id" | "name"> }[];
  languages: { language: Pick<Language, "id" | "name" | "code"> }[];
};

// Search results
export type SearchResult = {
  profiles: ProfileCard[];
  total: number;
  page: number;
  totalPages: number;
};

// User with profile
export type UserWithProfile = User & {
  profile: (Profile & { primaryProfession: Profession | null }) | null;
};

// Contact request with sender/receiver info
export type ContactRequestWithUsers = ContactRequest & {
  sender: User & { profile: Pick<Profile, "firstName" | "lastName" | "photoUrl" | "slug"> | null };
  receiver: User & { profile: Pick<Profile, "firstName" | "lastName" | "photoUrl" | "slug"> | null };
};

// Stats for admin dashboard
export type PlatformStats = {
  totalProfiles: number;
  verifiedProfiles: number;
  pendingProfiles: number;
  totalRecruiters: number;
  totalContactRequests: number;
  profilesByProfession: { profession: string; count: number }[];
  profilesByCity: { city: string; count: number }[];
};

export type { User, Profile, Profession, ProfessionCategory, Skill, SkillCategory, Experience, Education, PortfolioItem, AvailabilitySlot, Institution, ContactRequest, Language, Notification, UserRole };
