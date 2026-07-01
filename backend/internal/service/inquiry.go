package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"artjourneys/internal/captcha"
	"artjourneys/internal/email"
	"artjourneys/internal/models"
	"artjourneys/internal/repository"
)

// ErrSpam marks a submission rejected by the honeypot.
var ErrSpam = errors.New("spam detected")

// ErrCaptcha marks a submission that failed the human challenge.
var ErrCaptcha = errors.New("captcha verification failed")

// ErrInvalidJourney marks a journey_id that does not exist.
var ErrInvalidJourney = errors.New("journey not found")

// InquiryInput is the validated payload from the inquiry form.
type InquiryInput struct {
	Name          string
	Email         string
	Phone         string
	JourneyID     *string
	Message       string
	BudgetRange   string
	TravelDate    *time.Time
	Honeypot      string // hidden field — must be empty for a human
	CaptchaToken  string // signed math-challenge token issued by the API
	CaptchaAnswer string // the visitor's answer to that challenge
	RemoteIP      string
}

// NewCaptcha issues a fresh math challenge for the inquiry form.
func (s *InquiryService) NewCaptcha() captcha.Challenge {
	return s.captcha.Issue()
}

// InquiryService captures leads and notifies the admin inbox.
type InquiryService struct {
	repos   *repository.Repositories
	mailer  *email.Worker
	mailTo  string
	captcha captcha.Verifier
}

// Create validates and persists an inquiry, then enqueues a notification email.
func (s *InquiryService) Create(ctx context.Context, in InquiryInput) (models.Inquiry, error) {
	if strings.TrimSpace(in.Honeypot) != "" {
		return models.Inquiry{}, ErrSpam
	}

	if !s.captcha.Verify(in.CaptchaToken, in.CaptchaAnswer) {
		return models.Inquiry{}, ErrCaptcha
	}

	if in.JourneyID != nil && *in.JourneyID != "" {
		ok, err := s.repos.Journeys.Exists(ctx, *in.JourneyID)
		if err != nil {
			return models.Inquiry{}, err
		}
		if !ok {
			return models.Inquiry{}, ErrInvalidJourney
		}
	} else {
		in.JourneyID = nil
	}

	iq, err := s.repos.Inquiries.Create(ctx, repository.CreateInquiry{
		Name:        in.Name,
		Email:       in.Email,
		Phone:       in.Phone,
		JourneyID:   in.JourneyID,
		Message:     in.Message,
		BudgetRange: in.BudgetRange,
		TravelDate:  in.TravelDate,
	})
	if err != nil {
		return models.Inquiry{}, err
	}

	s.mailer.Enqueue(email.Message{
		To:      s.mailTo,
		Subject: fmt.Sprintf("VENTIS — Liên hệ mới từ %s", iq.Name),
		Body: fmt.Sprintf(
			"Một liên hệ mới vừa được gửi từ website VENTIS GROUP.\n\n"+
				"Họ tên: %s\nEmail: %s\nSố điện thoại: %s\nLĩnh vực quan tâm: %s\n\nNội dung:\n%s\n\n"+
				"— Gửi tự động từ ventis.9bricks.com",
			iq.Name, iq.Email, iq.Phone, iq.BudgetRange, iq.Message),
	})

	return iq, nil
}
