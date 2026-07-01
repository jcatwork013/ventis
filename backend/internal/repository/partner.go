package repository

import (
	"context"

	"artjourneys/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PartnerRepo struct{ pool *pgxpool.Pool }

// List returns every partner ordered by name.
func (r *PartnerRepo) List(ctx context.Context) ([]models.Partner, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, name, logo_url, category, website FROM partners ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []models.Partner{}
	for rows.Next() {
		var p models.Partner
		if err := rows.Scan(&p.ID, &p.Name, &p.LogoURL, &p.Category, &p.Website); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}
