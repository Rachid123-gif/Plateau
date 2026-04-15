import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().optional(),
  profession: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  language: z.string().optional(),
  experienceLevel: z.enum(["STUDENT", "JUNIOR", "INTERMEDIATE", "SENIOR", "EXPERT"]).optional(),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "UNAVAILABLE"]).optional(),
  institution: z.string().optional(),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(["relevance", "name", "recent", "views"]).default("relevance"),
});

export type SearchInput = z.infer<typeof searchSchema>;
