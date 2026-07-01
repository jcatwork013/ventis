package repository

import (
	"context"

	"artjourneys/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DestinationRepo struct{ pool *pgxpool.Pool }

const destinationCols = `id, slug, name, country, city, hero_image, summary, body_md, lat, lng, published, created_at`

func scanDestination(row pgx.Row) (models.Destination, error) {
	var d models.Destination
	err := row.Scan(&d.ID, &d.Slug, &d.Name, &d.Country, &d.City, &d.HeroImage,
		&d.Summary, &d.BodyMD, &d.Lat, &d.Lng, &d.Published, &d.CreatedAt)
	return d, err
}

// List returns all published destinations ordered by name.
func (r *DestinationRepo) List(ctx context.Context) ([]models.Destination, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT `+destinationCols+` FROM destinations WHERE published = true ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []models.Destination{}
	for rows.Next() {
		d, err := scanDestination(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

// GetBySlug returns a single published destination.
func (r *DestinationRepo) GetBySlug(ctx context.Context, slug string) (models.Destination, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+destinationCols+` FROM destinations WHERE slug = $1 AND published = true`, slug)
	d, err := scanDestination(row)
	if err == pgx.ErrNoRows {
		return d, ErrNotFound
	}
	return d, err
}
