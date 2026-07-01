package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SettingsRepo is a single-document JSON store keyed by name (e.g. "site").
type SettingsRepo struct{ pool *pgxpool.Pool }

// Get returns the raw JSON value for key, or ErrNotFound.
func (r *SettingsRepo) Get(ctx context.Context, key string) (json.RawMessage, error) {
	var raw json.RawMessage
	err := r.pool.QueryRow(ctx, `SELECT value FROM settings WHERE key = $1`, key).Scan(&raw)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return raw, err
}

// Set upserts the JSON value for key.
func (r *SettingsRepo) Set(ctx context.Context, key string, value json.RawMessage) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
		 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
		key, value,
	)
	return err
}

// SetIfAbsent writes value only when key does not already exist (seed helper).
func (r *SettingsRepo) SetIfAbsent(ctx context.Context, key string, value json.RawMessage) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
		key, value,
	)
	return err
}
