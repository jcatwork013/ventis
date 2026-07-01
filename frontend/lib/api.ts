import { z } from "zod";
import {
  DestinationSchema,
  JourneySchema,
  MetaSchema,
  PartnerSchema,
  StorySchema,
  type Destination,
  type Journey,
  type Meta,
  type Partner,
  type Story,
} from "./types";

// On the server (SSR/ISR) prefer API_INTERNAL_URL so fetches resolve inside the
// container network (e.g. http://backend:8080). In the browser, NEXT_PUBLIC_API_URL
// is inlined at build time and points at the publicly reachable API.
const BASE_URL =
  (typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) ?? "http://localhost:8080";

/** Default ISR window for content pages. */
const REVALIDATE = 300;

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOpts = {
  revalidate?: number | false;
  cache?: RequestCache;
};

async function getJSON<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  opts: FetchOpts = {},
): Promise<z.infer<S>> {
  const next =
    opts.cache === "no-store"
      ? undefined
      : { revalidate: opts.revalidate ?? REVALIDATE };

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    cache: opts.cache,
    next,
  });

  if (!res.ok) {
    throw new ApiError(`GET ${path} failed`, res.status);
  }
  const json = await res.json();
  return schema.parse(json);
}

const ListEnvelope = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), meta: MetaSchema });

const DataEnvelope = <T extends z.ZodTypeAny>(item: T) => z.object({ data: item });

const DataArrayEnvelope = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item) });

export type JourneyQuery = {
  theme?: string;
  destination?: string;
  page?: number;
  limit?: number;
};

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  async journeys(q: JourneyQuery = {}): Promise<{ data: Journey[]; meta: Meta }> {
    return getJSON(`/api/v1/journeys${qs(q)}`, ListEnvelope(JourneySchema));
  },

  async journey(slug: string): Promise<Journey> {
    const { data } = await getJSON(`/api/v1/journeys/${slug}`, DataEnvelope(JourneySchema), {
      cache: "no-store", // detail pages render fresh (SSR)
    });
    return data;
  },

  async destinations(): Promise<Destination[]> {
    const { data } = await getJSON(`/api/v1/destinations`, DataArrayEnvelope(DestinationSchema));
    return data;
  },

  async destination(slug: string): Promise<{ destination: Destination; journeys: Journey[] }> {
    const schema = z.object({
      data: z.object({
        destination: DestinationSchema,
        journeys: z.array(JourneySchema),
      }),
    });
    const { data } = await getJSON(`/api/v1/destinations/${slug}`, schema, { cache: "no-store" });
    return data;
  },

  async stories(q: { page?: number; limit?: number } = {}): Promise<{ data: Story[]; meta: Meta }> {
    return getJSON(`/api/v1/stories${qs(q)}`, ListEnvelope(StorySchema));
  },

  async story(slug: string): Promise<Story> {
    const { data } = await getJSON(`/api/v1/stories/${slug}`, DataEnvelope(StorySchema), {
      cache: "no-store",
    });
    return data;
  },

  async partners(): Promise<Partner[]> {
    const { data } = await getJSON(`/api/v1/partners`, DataArrayEnvelope(PartnerSchema));
    return data;
  },
};

const CaptchaSchema = z.object({ question: z.string(), token: z.string() });
export type Captcha = z.infer<typeof CaptchaSchema>;

/** Fetch a fresh "add two numbers" anti-bot challenge from the API. */
export async function getCaptcha(): Promise<Captcha> {
  const res = await fetch(`${BASE_URL}/api/v1/captcha`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("Could not load the verification challenge.", res.status);
  const json = await res.json();
  return CaptchaSchema.parse(json.data);
}

/** Inquiry submission is a client-side POST (see InquiryForm). */
export async function submitInquiry(payload: unknown): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = "Could not submit your inquiry. Please try again.";
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
}

export { ApiError, BASE_URL };
