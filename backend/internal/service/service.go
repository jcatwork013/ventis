package service

import (
	"artjourneys/internal/auth"
	"artjourneys/internal/captcha"
	"artjourneys/internal/email"
	"artjourneys/internal/repository"
)

// Services bundles the application services exposed to HTTP handlers.
type Services struct {
	Content *ContentService
	Inquiry *InquiryService
	Admin   *AdminService
}

// New wires services to repositories, the email worker, auth and captcha.
func New(repos *repository.Repositories, mailer *email.Worker, mailTo string, authMgr *auth.Manager, cap captcha.Verifier) *Services {
	return &Services{
		Content: &ContentService{repos: repos},
		Inquiry: &InquiryService{repos: repos, mailer: mailer, mailTo: mailTo, captcha: cap},
		Admin:   &AdminService{repos: repos, auth: authMgr},
	}
}
