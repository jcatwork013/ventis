-- ART JOURNEYS — initial schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS destinations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    country     TEXT NOT NULL,
    city        TEXT NOT NULL DEFAULT '',
    hero_image  TEXT NOT NULL DEFAULT '',
    summary     TEXT NOT NULL DEFAULT '',
    body_md     TEXT NOT NULL DEFAULT '',
    lat         DOUBLE PRECISION NOT NULL DEFAULT 0,
    lng         DOUBLE PRECISION NOT NULL DEFAULT 0,
    published   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journeys (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug           TEXT NOT NULL UNIQUE,
    title          TEXT NOT NULL,
    subtitle       TEXT NOT NULL DEFAULT '',
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    duration_days  INT NOT NULL DEFAULT 0,
    price_from     INT NOT NULL DEFAULT 0,
    currency       TEXT NOT NULL DEFAULT 'USD',
    hero_image     TEXT NOT NULL DEFAULT '',
    gallery        TEXT[] NOT NULL DEFAULT '{}',
    highlights     TEXT[] NOT NULL DEFAULT '{}',
    body_md        TEXT NOT NULL DEFAULT '',
    theme          TEXT[] NOT NULL DEFAULT '{}',
    published      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_journeys_destination ON journeys(destination_id);
CREATE INDEX IF NOT EXISTS idx_journeys_theme ON journeys USING GIN(theme);

CREATE TABLE IF NOT EXISTS stories (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    excerpt      TEXT NOT NULL DEFAULT '',
    cover_image  TEXT NOT NULL DEFAULT '',
    body_md      TEXT NOT NULL DEFAULT '',
    author       TEXT NOT NULL DEFAULT '',
    published_at TIMESTAMPTZ,
    published    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS partners (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      TEXT NOT NULL,
    logo_url  TEXT NOT NULL DEFAULT '',
    category  TEXT NOT NULL DEFAULT '',
    website   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS inquiries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT NOT NULL DEFAULT '',
    journey_id   UUID REFERENCES journeys(id) ON DELETE SET NULL,
    message      TEXT NOT NULL DEFAULT '',
    budget_range TEXT NOT NULL DEFAULT '',
    travel_date  DATE,
    status       TEXT NOT NULL DEFAULT 'new',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
