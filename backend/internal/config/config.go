package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration, sourced from environment variables.
type Config struct {
	Port           string
	DatabaseURL    string
	RedisURL       string
	AllowedOrigins []string

	SMTPHost string
	SMTPPort string
	SMTPUser string
	SMTPPass string
	SMTPFrom string
	// MailTo is the inbox that receives new inquiry notifications.
	MailTo string

	// Admin / auth
	JWTSecret     string
	AdminEmail    string // master admin bootstrapped on startup
	AdminPassword string
	AdminName     string

	// Uploads
	UploadDir string // where uploaded images are written
	PublicURL string // absolute base URL of this API (for building image URLs)

	Env string
}

// Load reads configuration from the environment. A local .env file is loaded
// when present (ignored in production where env vars are injected directly).
func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:           env("PORT", "8080"),
		DatabaseURL:    env("DATABASE_URL", "postgres://artjourneys:artjourneys@localhost:5432/artjourneys?sslmode=disable"),
		RedisURL:       env("REDIS_URL", ""),
		AllowedOrigins: splitCSV(env("ALLOWED_ORIGINS", "http://localhost:3000")),
		SMTPHost:       env("SMTP_HOST", ""),
		SMTPPort:       env("SMTP_PORT", "587"),
		SMTPUser:       env("SMTP_USER", ""),
		SMTPPass:       env("SMTP_PASS", ""),
		SMTPFrom:       env("SMTP_FROM", "no-reply@artjourneys.travel"),
		MailTo:         env("MAIL_TO", "studio@artjourneys.travel"),

		JWTSecret:     env("JWT_SECRET", "change-me-in-production-please-32+chars"),
		AdminEmail:    env("ADMIN_EMAIL", "admin@ventis.9bricks.com"),
		AdminPassword: env("ADMIN_PASSWORD", "ChangeMe!2026"),
		AdminName:     env("ADMIN_NAME", "Master Admin"),

		UploadDir: env("UPLOAD_DIR", "/app/uploads"),
		PublicURL: strings.TrimRight(env("PUBLIC_URL", "http://localhost:8080"), "/"),

		Env: env("APP_ENV", "development"),
	}
	return cfg
}

// HasSMTP reports whether real SMTP delivery is configured.
func (c *Config) HasSMTP() bool { return c.SMTPHost != "" }

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
