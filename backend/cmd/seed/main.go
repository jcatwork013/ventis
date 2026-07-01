// Command seed loads demo content (destinations, journeys, stories, partners)
// into the database. It is idempotent: re-running it does not duplicate rows.
package main

import (
	"context"
	_ "embed"
	"log"
	"time"

	"artjourneys/internal/config"
	"artjourneys/internal/db"
)

//go:embed seed.sql
var seedSQL string

func main() {
	cfg := config.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	// Ensure the schema exists before seeding.
	if err := db.Migrate(ctx, pool); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	if _, err := pool.Exec(ctx, seedSQL); err != nil {
		log.Fatalf("seed: %v", err)
	}
	log.Println("seed complete: destinations, journeys, stories, partners loaded")
}
