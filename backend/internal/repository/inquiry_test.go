package repository

import (
	"context"
	"os"
	"testing"

	"artjourneys/internal/db"
)

// TestInquiryRepo_Create is an integration test. It runs only when
// TEST_DATABASE_URL is set (e.g. in CI with a Postgres service) and is skipped
// otherwise so the unit suite stays self-contained.
func TestInquiryRepo_Create(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping integration test")
	}

	ctx := context.Background()
	pool, err := db.Connect(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(ctx, pool); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	repo := &InquiryRepo{pool: pool}
	iq, err := repo.Create(ctx, CreateInquiry{
		Name:    "Test Person",
		Email:   "test@example.com",
		Message: "I would like to know more about the Kyoto craft journey.",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if iq.ID == "" {
		t.Fatal("expected a generated id")
	}
	if iq.Status != "new" {
		t.Fatalf("expected status 'new', got %q", iq.Status)
	}

	// Cleanup.
	if _, err := pool.Exec(ctx, `DELETE FROM inquiries WHERE id = $1`, iq.ID); err != nil {
		t.Fatalf("cleanup: %v", err)
	}
}
