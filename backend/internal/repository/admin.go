package repository

import (
	"context"
	"errors"

	"artjourneys/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AdminRepo is data access for back-office users.
type AdminRepo struct{ pool *pgxpool.Pool }

// GetByEmail returns the admin with the given email, or ErrNotFound.
func (r *AdminRepo) GetByEmail(ctx context.Context, email string) (models.Admin, error) {
	var a models.Admin
	err := r.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name, role, created_at FROM admins WHERE lower(email) = lower($1)`,
		email,
	).Scan(&a.ID, &a.Email, &a.PasswordHash, &a.Name, &a.Role, &a.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Admin{}, ErrNotFound
	}
	return a, err
}

// GetByID returns the admin with the given id, or ErrNotFound.
func (r *AdminRepo) GetByID(ctx context.Context, id string) (models.Admin, error) {
	var a models.Admin
	err := r.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name, role, created_at FROM admins WHERE id = $1`,
		id,
	).Scan(&a.ID, &a.Email, &a.PasswordHash, &a.Name, &a.Role, &a.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Admin{}, ErrNotFound
	}
	return a, err
}

// UpdatePassword replaces the password hash for one admin.
func (r *AdminRepo) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	tag, err := r.pool.Exec(ctx,
		`UPDATE admins SET password_hash = $2 WHERE id = $1`, id, passwordHash)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// EnsureMaster inserts the master admin if no admin with that email exists yet.
// It never overwrites an existing account (so a changed password is preserved).
func (r *AdminRepo) EnsureMaster(ctx context.Context, email, passwordHash, name string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO admins (email, password_hash, name, role)
		 VALUES ($1, $2, $3, 'master')
		 ON CONFLICT (email) DO NOTHING`,
		email, passwordHash, name,
	)
	return err
}
