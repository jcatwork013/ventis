package handler

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"artjourneys/internal/auth"
	"artjourneys/internal/cache"
	"artjourneys/internal/captcha"
	"artjourneys/internal/email"
	"artjourneys/internal/repository"
	"artjourneys/internal/service"
)

// newTestRouter builds the router with a service whose repositories are not
// backed by a database. This is sufficient to exercise request validation and
// the honeypot short-circuit, which both return before any DB access.
func newTestRouter() http.Handler {
	repos := repository.New(nil)
	mailer := email.NewWorker(email.NoopSender{}, 1)
	authMgr := auth.NewManager("test-secret-key-at-least-32-characters!!", time.Hour)
	cap := captcha.NewMath("test-secret", time.Minute)
	svc := service.New(repos, mailer, "studio@example.com", authMgr, cap)
	return NewRouter(svc, cache.Noop{}, RouterDeps{AllowedOrigins: []string{"http://localhost:3000"}})
}

func post(t *testing.T, r http.Handler, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/inquiries", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

func TestCreateInquiry_ValidationFails(t *testing.T) {
	r := newTestRouter()
	rec := post(t, r, `{}`)
	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422, got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "validation_failed") {
		t.Fatalf("expected validation_failed code, got %s", rec.Body.String())
	}
}

func TestCreateInquiry_MalformedJSON(t *testing.T) {
	r := newTestRouter()
	rec := post(t, r, `{not json`)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestCreateInquiry_HoneypotSilentlyAccepted(t *testing.T) {
	r := newTestRouter()
	// A filled honeypot ("website") must look successful but never reach the DB.
	body := `{"name":"Spam Bot","email":"bot@example.com","phone":"0901234567","message":"buy cheap watches now","website":"http://spam.example"}`
	rec := post(t, r, body)
	if rec.Code != http.StatusAccepted {
		t.Fatalf("expected 202 for honeypot, got %d (%s)", rec.Code, rec.Body.String())
	}
}

func TestCreateInquiry_RejectsBadPhone(t *testing.T) {
	r := newTestRouter()
	body := `{"name":"Nguyen Van A","email":"a@example.com","phone":"12345","message":"Toi muon tim hieu them ve du an"}`
	rec := post(t, r, body)
	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422 for bad phone, got %d (%s)", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "điện thoại") {
		t.Fatalf("expected a phone-specific message, got %s", rec.Body.String())
	}
}

func TestNormalizePhone(t *testing.T) {
	cases := map[string]string{
		"0901 234 567":    "0901234567",
		"0901-234-567":    "0901234567",
		"(090) 123 4567":  "0901234567",
		"+84 901 234 567": "+84901234567",
		"0084901234567":   "+84901234567",
		"84901234567":     "+84901234567",
	}
	for in, want := range cases {
		if got := normalizePhone(in); got != want {
			t.Errorf("normalizePhone(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestValidateVNPhonePattern(t *testing.T) {
	valid := []string{"0901234567", "0387654321", "+84901234567", "0084 901 234 567", "(090)123-4567"}
	for _, p := range valid {
		if !vnPhoneRE.MatchString(normalizePhone(p)) {
			t.Errorf("expected %q to be a valid VN phone", p)
		}
	}

	invalid := []string{"", "123", "090123456", "09012345678", "+8490123456", "1234567890", "+1 415 555 0100"}
	for _, p := range invalid {
		if vnPhoneRE.MatchString(normalizePhone(p)) {
			t.Errorf("expected %q to be an invalid VN phone", p)
		}
	}
}

func TestHealthz(t *testing.T) {
	r := newTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}
