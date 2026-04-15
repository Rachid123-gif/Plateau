import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  artistName: z.string().optional().nullable(),
  bio: z.string().max(2000, "La bio ne doit pas dépasser 2000 caractères").optional().nullable(),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  website: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  primaryProfessionId: z.string().optional().nullable(),
  experienceLevel: z.enum(["STUDENT", "JUNIOR", "INTERMEDIATE", "SENIOR", "EXPERT"]),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "UNAVAILABLE"]),
  isPublic: z.boolean().default(true),
});

export const experienceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  production: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  year: z.number().int().min(1950).max(2030).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

export const educationSchema = z.object({
  institutionId: z.string().optional().nullable(),
  customInstitution: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  field: z.string().optional().nullable(),
  startYear: z.number().int().min(1950).max(2030).optional().nullable(),
  endYear: z.number().int().min(1950).max(2030).optional().nullable(),
});

export const portfolioItemSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "LINK"]),
  url: z.string().url("URL invalide"),
  thumbnailUrl: z.string().url().optional().nullable(),
  year: z.number().int().min(1950).max(2030).optional().nullable(),
});

export const availabilitySlotSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(["AVAILABLE", "BUSY", "UNAVAILABLE"]),
  note: z.string().max(200).optional().nullable(),
});

export const contactRequestSchema = z.object({
  receiverId: z.string().min(1, "Le destinataire est requis"),
  subject: z.string().min(1, "L'objet est requis").max(200),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>;
export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
