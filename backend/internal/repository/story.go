package repository

import (
	"context"

	"artjourneys/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type StoryRepo struct{ pool *pgxpool.Pool }

const storyCols = `id, slug, title, excerpt, cover_image, body_md, author, published_at, published`

func scanStory(row pgx.Row) (models.Story, error) {
	var s models.Story
	err := row.Scan(&s.ID, &s.Slug, &s.Title, &s.Excerpt, &s.CoverImage,
		&s.BodyMD, &s.Author, &s.PublishedAt, &s.Published)
	return s, err
}

// List returns a page of published stories plus the total count.
func (r *StoryRepo) List(ctx context.Context, page, limit int) ([]models.Story, int, error) {
	var total int
	if err := r.pool.QueryRow(ctx,
		`SELECT count(*) FROM stories WHERE published = true`).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.pool.Query(ctx,
		`SELECT `+storyCols+` FROM stories WHERE published = true
		 ORDER BY published_at DESC NULLS LAST LIMIT $1 OFFSET $2`,
		limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	out := []models.Story{}
	for rows.Next() {
		s, err := scanStory(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, s)
	}
	return out, total, rows.Err()
}

// GetBySlug returns a single published story.
func (r *StoryRepo) GetBySlug(ctx context.Context, slug string) (models.Story, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+storyCols+` FROM stories WHERE slug = $1 AND published = true`, slug)
	s, err := scanStory(row)
	if err == pgx.ErrNoRows {
		return s, ErrNotFound
	}
	return s, err
}
