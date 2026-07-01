package service

import (
	"context"

	"artjourneys/internal/models"
	"artjourneys/internal/repository"
)

// ContentService serves read-only public content.
type ContentService struct {
	repos *repository.Repositories
}

func (s *ContentService) Journeys(ctx context.Context, f repository.JourneyFilter) ([]models.Journey, int, error) {
	return s.repos.Journeys.List(ctx, f)
}

func (s *ContentService) Journey(ctx context.Context, slug string) (models.Journey, error) {
	return s.repos.Journeys.GetBySlug(ctx, slug)
}

func (s *ContentService) Destinations(ctx context.Context) ([]models.Destination, error) {
	return s.repos.Destinations.List(ctx)
}

// Destination returns a destination plus its related journeys.
func (s *ContentService) Destination(ctx context.Context, slug string) (models.Destination, []models.Journey, error) {
	d, err := s.repos.Destinations.GetBySlug(ctx, slug)
	if err != nil {
		return d, nil, err
	}
	journeys, err := s.repos.Journeys.ListByDestination(ctx, slug)
	return d, journeys, err
}

func (s *ContentService) Stories(ctx context.Context, page, limit int) ([]models.Story, int, error) {
	return s.repos.Stories.List(ctx, page, limit)
}

func (s *ContentService) Story(ctx context.Context, slug string) (models.Story, error) {
	return s.repos.Stories.GetBySlug(ctx, slug)
}

func (s *ContentService) Partners(ctx context.Context) ([]models.Partner, error) {
	return s.repos.Partners.List(ctx)
}
