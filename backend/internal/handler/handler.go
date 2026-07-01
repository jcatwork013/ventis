package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"artjourneys/internal/auth"
	"artjourneys/internal/cache"
	"artjourneys/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
)

// Handler holds the dependencies shared by all HTTP handlers.
type Handler struct {
	svc       *service.Services
	cache     cache.Cache
	validate  *validator.Validate
	auth      *auth.Manager
	uploadDir string
	publicURL string
}

// RouterDeps groups the dependencies the router needs beyond services/cache.
type RouterDeps struct {
	AllowedOrigins []string
	Auth           *auth.Manager
	UploadDir      string
	PublicURL      string
}

// NewRouter builds the fully configured chi router for the API.
func NewRouter(svc *service.Services, c cache.Cache, deps RouterDeps) http.Handler {
	v := validator.New()
	_ = v.RegisterValidation("vnphone", validateVNPhone)

	h := &Handler{
		svc:       svc,
		cache:     c,
		validate:  v,
		auth:      deps.Auth,
		uploadDir: deps.UploadDir,
		publicURL: deps.PublicURL,
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(20 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   deps.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	limiter := newIPRateLimiter(5, 5)
	loginLimiter := newIPRateLimiter(10, 5)

	r.Get("/healthz", h.health)

	// Uploaded images, served from the persistent uploads volume.
	fs := http.StripPrefix("/uploads/", http.FileServer(http.Dir(deps.UploadDir)))
	r.Get("/uploads/*", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=2592000")
		fs.ServeHTTP(w, req)
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Public reads.
		r.Get("/content", h.publicContent)
		r.Get("/journeys", h.listJourneys)
		r.Get("/journeys/{slug}", h.getJourney)
		r.Get("/destinations", h.listDestinations)
		r.Get("/destinations/{slug}", h.getDestination)
		r.Get("/stories", h.listStories)
		r.Get("/stories/{slug}", h.getStory)
		r.Get("/partners", h.listPartners)

		r.Get("/captcha", h.captchaChallenge)
		r.With(limiter.middleware).Post("/inquiries", h.createInquiry)

		// Admin: login is public (throttled), the rest require a Bearer token.
		r.With(loginLimiter.middleware).Post("/admin/login", h.adminLogin)
		r.Group(func(r chi.Router) {
			r.Use(h.requireAdmin)
			r.Put("/admin/content", h.adminSaveContent)
			r.Post("/admin/upload", h.adminUpload)
			r.Get("/admin/uploads", h.adminListUploads)

			r.Get("/admin/stats", h.adminStats)
			r.Get("/admin/me", h.adminMe)
			r.Post("/admin/password", h.adminChangePassword)

			r.Get("/admin/inquiries", h.adminInquiries)
			r.Get("/admin/inquiries/export", h.adminExportInquiries)
			r.Patch("/admin/inquiries/{id}", h.adminUpdateInquiry)
			r.Delete("/admin/inquiries/{id}", h.adminDeleteInquiry)
		})
	})

	return r
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// cached serves a GET response from Redis when available, otherwise computes
// it via produce(), stores the serialized JSON for ttl, and returns it.
func (h *Handler) cached(w http.ResponseWriter, r *http.Request, key string, ttl time.Duration, produce func() (any, error)) {
	ctx := r.Context()
	if raw, ok := h.cache.Get(ctx, key); ok {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("X-Cache", "HIT")
		_, _ = w.Write([]byte(raw))
		return
	}

	v, err := produce()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Something went wrong.")
		return
	}

	body, err := json.Marshal(v)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Something went wrong.")
		return
	}
	h.cache.Set(ctx, key, string(body), ttl)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Cache", "MISS")
	_, _ = w.Write(body)
}

// pagination parses page/limit query params with sane bounds.
func pagination(r *http.Request) (page, limit int) {
	page = atoiDefault(r.URL.Query().Get("page"), 1)
	limit = atoiDefault(r.URL.Query().Get("limit"), 9)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 9
	}
	return page, limit
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return n
}

// withTimeout derives a short context for repository calls.
func reqCtx(r *http.Request) (context.Context, context.CancelFunc) {
	return context.WithTimeout(r.Context(), 10*time.Second)
}
