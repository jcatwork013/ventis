import { z } from "zod";

/** Zod schemas mirror the Go API JSON. Responses are parsed, never trusted raw. */

export const DestinationRefSchema = z.object({
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
});

export const JourneySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
  destination_id: z.string(),
  duration_days: z.number(),
  price_from: z.number(),
  currency: z.string(),
  hero_image: z.string(),
  gallery: z.array(z.string()).nullable().default([]),
  highlights: z.array(z.string()).nullable().default([]),
  body_md: z.string().default(""),
  theme: z.array(z.string()).nullable().default([]),
  published: z.boolean(),
  created_at: z.string(),
  destination: DestinationRefSchema.nullish(),
});

export const DestinationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
  hero_image: z.string(),
  summary: z.string().default(""),
  body_md: z.string().default(""),
  lat: z.number(),
  lng: z.number(),
  published: z.boolean(),
  created_at: z.string(),
});

export const StorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().default(""),
  cover_image: z.string(),
  body_md: z.string().default(""),
  author: z.string().default(""),
  published_at: z.string().nullable(),
  published: z.boolean(),
});

export const PartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo_url: z.string(),
  category: z.string(),
  website: z.string(),
});

export const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export type Journey = z.infer<typeof JourneySchema>;
export type Destination = z.infer<typeof DestinationSchema>;
export type Story = z.infer<typeof StorySchema>;
export type Partner = z.infer<typeof PartnerSchema>;
export type Meta = z.infer<typeof MetaSchema>;

export const THEMES = ["art", "architecture", "craft", "biennale"] as const;
export type Theme = (typeof THEMES)[number];
