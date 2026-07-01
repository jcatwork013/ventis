package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"artjourneys/internal/auth"
	"artjourneys/internal/cache"
	"artjourneys/internal/captcha"
	"artjourneys/internal/config"
	"artjourneys/internal/db"
	"artjourneys/internal/email"
	"artjourneys/internal/handler"
	"artjourneys/internal/repository"
	"artjourneys/internal/service"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(ctx, pool); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	log.Println("migrations applied")

	// Cache: Redis when configured, otherwise a no-op.
	var c cache.Cache = cache.Noop{}
	if cfg.RedisURL != "" {
		rc, err := cache.NewRedis(cfg.RedisURL)
		if err != nil {
			log.Printf("redis unavailable, falling back to no-op cache: %v", err)
		} else {
			c = rc
			log.Println("redis cache enabled")
		}
	}

	// Email: real SMTP when configured, otherwise log-only.
	var sender email.Sender = email.NoopSender{}
	if cfg.HasSMTP() {
		sender = email.SMTPSender{
			Host: cfg.SMTPHost, Port: cfg.SMTPPort,
			User: cfg.SMTPUser, Pass: cfg.SMTPPass, From: cfg.SMTPFrom,
		}
		log.Println("smtp email enabled")
	}
	mailer := email.NewWorker(sender, 64)
	defer mailer.Close()

	authMgr := auth.NewManager(cfg.JWTSecret, 7*24*time.Hour)
	captchaVerifier := captcha.NewMath(cfg.JWTSecret, 10*time.Minute)

	repos := repository.New(pool)
	svc := service.New(repos, mailer, cfg.MailTo, authMgr, captchaVerifier)

	// Bootstrap the master admin and seed default site content (idempotent).
	if err := svc.Admin.Bootstrap(ctx, cfg.AdminEmail, cfg.AdminPassword, cfg.AdminName); err != nil {
		log.Printf("admin bootstrap: %v", err)
	} else {
		log.Printf("master admin ready: %s", cfg.AdminEmail)
	}

	if err := os.MkdirAll(cfg.UploadDir, 0o755); err != nil {
		log.Printf("uploads dir: %v", err)
	}

	router := handler.NewRouter(svc, c, handler.RouterDeps{
		AllowedOrigins: cfg.AllowedOrigins,
		Auth:           authMgr,
		UploadDir:      cfg.UploadDir,
		PublicURL:      cfg.PublicURL,
	})

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("ART JOURNEYS API listening on :%s (env=%s)", cfg.Port, cfg.Env)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("shutting down...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
