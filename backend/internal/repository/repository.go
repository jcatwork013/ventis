package repository

import (
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a single-row lookup matches nothing.
var ErrNotFound = errors.New("not found")

// Repositories bundles all data-access repositories.
type Repositories struct {
	Destinations *DestinationRepo
	Journeys     *JourneyRepo
	Stories      *StoryRepo
	Partners     *PartnerRepo
	Inquiries    *InquiryRepo
	Admins       *AdminRepo
	Settings     *SettingsRepo
}

// New wires every repository to a shared connection pool.
func New(pool *pgxpool.Pool) *Repositories {
	return &Repositories{
		Destinations: &DestinationRepo{pool: pool},
		Journeys:     &JourneyRepo{pool: pool},
		Stories:      &StoryRepo{pool: pool},
		Partners:     &PartnerRepo{pool: pool},
		Inquiries:    &InquiryRepo{pool: pool},
		Admins:       &AdminRepo{pool: pool},
		Settings:     &SettingsRepo{pool: pool},
	}
}
