package service

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"artjourneys/internal/auth"
	"artjourneys/internal/models"
	"artjourneys/internal/repository"
)

// ErrInvalidCredentials is returned for a failed login or wrong current password.
var ErrInvalidCredentials = errors.New("invalid credentials")

// ErrNotFound is returned when a targeted record does not exist.
var ErrNotFound = errors.New("not found")

// siteContentKey is the settings row that holds the editable landing document.
const siteContentKey = "site"

// AdminService handles authentication and back-office content management.
type AdminService struct {
	repos *repository.Repositories
	auth  *auth.Manager
}

// Login verifies credentials and returns a signed JWT.
func (s *AdminService) Login(ctx context.Context, email, password string) (token string, exp time.Time, admin models.Admin, err error) {
	a, err := s.repos.Admins.GetByEmail(ctx, email)
	if errors.Is(err, repository.ErrNotFound) {
		return "", time.Time{}, models.Admin{}, ErrInvalidCredentials
	}
	if err != nil {
		return "", time.Time{}, models.Admin{}, err
	}
	if !auth.CheckPassword(a.PasswordHash, password) {
		return "", time.Time{}, models.Admin{}, ErrInvalidCredentials
	}
	token, exp, err = s.auth.Issue(a.ID, a.Email, a.Role)
	return token, exp, a, err
}

// Bootstrap ensures the master admin and the default site content exist.
func (s *AdminService) Bootstrap(ctx context.Context, email, password, name string) error {
	hash, err := auth.HashPassword(password)
	if err != nil {
		return err
	}
	if err := s.repos.Admins.EnsureMaster(ctx, email, hash, name); err != nil {
		return err
	}
	return s.repos.Settings.SetIfAbsent(ctx, siteContentKey, DefaultSiteContent)
}

// Content returns the current site document, falling back to the default.
func (s *AdminService) Content(ctx context.Context) (json.RawMessage, error) {
	raw, err := s.repos.Settings.Get(ctx, siteContentKey)
	if errors.Is(err, repository.ErrNotFound) {
		return DefaultSiteContent, nil
	}
	return raw, err
}

// SaveContent replaces the site document. The payload must be valid JSON object.
func (s *AdminService) SaveContent(ctx context.Context, raw json.RawMessage) error {
	var probe map[string]any
	if err := json.Unmarshal(raw, &probe); err != nil {
		return errors.New("content must be a JSON object")
	}
	return s.repos.Settings.Set(ctx, siteContentKey, raw)
}

// Inquiries lists captured leads for the admin inbox, filtered + paginated.
func (s *AdminService) Inquiries(ctx context.Context, f repository.InquiryFilter, limit, offset int) ([]models.Inquiry, int, error) {
	return s.repos.Inquiries.List(ctx, f, limit, offset)
}

// ExportInquiries returns every lead matching the filter (for CSV download).
func (s *AdminService) ExportInquiries(ctx context.Context, f repository.InquiryFilter) ([]models.Inquiry, error) {
	return s.repos.Inquiries.Export(ctx, f)
}

// UpdateInquiry changes a lead's status and/or notes. A non-empty status must
// be one of the allowed values.
func (s *AdminService) UpdateInquiry(ctx context.Context, id string, status, notes *string) (models.Inquiry, error) {
	if status != nil && !repository.ValidStatus(*status) {
		return models.Inquiry{}, errors.New("trạng thái không hợp lệ")
	}
	iq, err := s.repos.Inquiries.Update(ctx, id, repository.InquiryPatch{Status: status, Notes: notes})
	if errors.Is(err, repository.ErrNotFound) {
		return models.Inquiry{}, ErrNotFound
	}
	return iq, err
}

// DeleteInquiry removes a lead permanently.
func (s *AdminService) DeleteInquiry(ctx context.Context, id string) error {
	err := s.repos.Inquiries.Delete(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return ErrNotFound
	}
	return err
}

// Stats returns dashboard aggregates for the inbox.
func (s *AdminService) Stats(ctx context.Context) (repository.InquiryStats, error) {
	return s.repos.Inquiries.Stats(ctx)
}

// GetAdmin returns the back-office user with the given id (for /me).
func (s *AdminService) GetAdmin(ctx context.Context, id string) (models.Admin, error) {
	a, err := s.repos.Admins.GetByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return models.Admin{}, ErrNotFound
	}
	return a, err
}

// ChangePassword verifies the current password then sets a new one.
func (s *AdminService) ChangePassword(ctx context.Context, id, current, next string) error {
	a, err := s.repos.Admins.GetByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	if !auth.CheckPassword(a.PasswordHash, current) {
		return ErrInvalidCredentials
	}
	hash, err := auth.HashPassword(next)
	if err != nil {
		return err
	}
	return s.repos.Admins.UpdatePassword(ctx, id, hash)
}
