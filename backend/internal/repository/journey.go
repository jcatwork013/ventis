package repository

import (
	"context"
	"strconv"
	"strings"

	"artjourneys/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type JourneyRepo struct{ pool *pgxpool.Pool }

// JourneyFilter narrows a journey listing.
type JourneyFilter struct {
	Theme       string // matches when present in the theme[] array
	Destination string // destination slug
	Page        int
	Limit       int
}

// journeySelect joins the destination so list/detail responses can embed a
// lightweight destination reference without a second round-trip.
const journeySelect = `
SELECT j.id, j.slug, j.title, j.subtitle, j.destination_id, j.duration_days,
       j.price_from, j.currency, j.hero_image, j.gallery, j.highlights,
       j.body_md, j.theme, j.published, j.created_at,
       d.slug, d.name, d.country, d.city
FROM journeys j
LEFT JOIN destinations d ON d.id = j.destination_id`

func scanJourney(row pgx.Row) (models.Journey, error) {
	var j models.Journey
	var dSlug, dName, dCountry, dCity *string
	err := row.Scan(&j.ID, &j.Slug, &j.Title, &j.Subtitle, &j.DestinationID,
		&j.DurationDays, &j.PriceFrom, &j.Currency, &j.HeroImage, &j.Gallery,
		&j.Highlights, &j.BodyMD, &j.Theme, &j.Published, &j.CreatedAt,
		&dSlug, &dName, &dCountry, &dCity)
	if err != nil {
		return j, err
	}
	if dSlug != nil {
		j.Destination = &models.DestinationRef{
			Slug: *dSlug, Name: deref(dName), Country: deref(dCountry), City: deref(dCity),
		}
	}
	return j, nil
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// List returns a page of published journeys plus the total matching count.
func (r *JourneyRepo) List(ctx context.Context, f JourneyFilter) ([]models.Journey, int, error) {
	where := []string{"j.published = true"}
	args := []any{}

	if f.Theme != "" {
		args = append(args, f.Theme)
		where = append(where, "$"+strconv.Itoa(len(args))+" = ANY(j.theme)")
	}
	if f.Destination != "" {
		args = append(args, f.Destination)
		where = append(where, "d.slug = $"+strconv.Itoa(len(args)))
	}
	whereSQL := "WHERE " + strings.Join(where, " AND ")

	var total int
	countSQL := `SELECT count(*) FROM journeys j LEFT JOIN destinations d ON d.id = j.destination_id ` + whereSQL
	if err := r.pool.QueryRow(ctx, countSQL, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, f.Limit)
	limitPos := len(args)
	args = append(args, (f.Page-1)*f.Limit)
	offsetPos := len(args)

	q := journeySelect + " " + whereSQL +
		" ORDER BY j.created_at DESC LIMIT $" + strconv.Itoa(limitPos) + " OFFSET $" + strconv.Itoa(offsetPos)

	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	out := []models.Journey{}
	for rows.Next() {
		j, err := scanJourney(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, j)
	}
	return out, total, rows.Err()
}

// GetBySlug returns a single published journey with its destination.
func (r *JourneyRepo) GetBySlug(ctx context.Context, slug string) (models.Journey, error) {
	row := r.pool.QueryRow(ctx, journeySelect+" WHERE j.slug = $1 AND j.published = true", slug)
	j, err := scanJourney(row)
	if err == pgx.ErrNoRows {
		return j, ErrNotFound
	}
	return j, err
}

// ListByDestination returns published journeys for a destination slug.
func (r *JourneyRepo) ListByDestination(ctx context.Context, destSlug string) ([]models.Journey, error) {
	rows, err := r.pool.Query(ctx,
		journeySelect+" WHERE d.slug = $1 AND j.published = true ORDER BY j.created_at DESC", destSlug)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []models.Journey{}
	for rows.Next() {
		j, err := scanJourney(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, j)
	}
	return out, rows.Err()
}

// Exists reports whether a journey id is present (used to validate inquiries).
func (r *JourneyRepo) Exists(ctx context.Context, id string) (bool, error) {
	var ok bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM journeys WHERE id = $1)`, id).Scan(&ok)
	return ok, err
}
