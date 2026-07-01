package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"artjourneys/internal/service"

	"github.com/go-playground/validator/v10"
)

// vnPhoneRE matches a normalised Vietnamese phone number: either a domestic
// 10-digit number starting with 0, or the international +84 form (9 digits
// after the country code). Separators are stripped before matching.
var vnPhoneRE = regexp.MustCompile(`^(?:0\d{9}|\+84\d{9})$`)

// normalizePhone removes spaces and common separators, and rewrites a leading
// 84/0084 country code into the canonical +84 form.
func normalizePhone(s string) string {
	s = strings.Map(func(r rune) rune {
		switch r {
		case ' ', '.', '-', '(', ')', '\t':
			return -1
		}
		return r
	}, strings.TrimSpace(s))
	switch {
	case strings.HasPrefix(s, "0084"):
		s = "+84" + s[4:]
	case strings.HasPrefix(s, "84") && len(s) == 11:
		s = "+" + s
	}
	return s
}

// validateVNPhone is the "vnphone" struct-tag validator.
func validateVNPhone(fl validator.FieldLevel) bool {
	return vnPhoneRE.MatchString(normalizePhone(fl.Field().String()))
}

// inquiryRequest is the JSON body for POST /inquiries.
type inquiryRequest struct {
	Name        string  `json:"name" validate:"required,min=2,max=120"`
	Email       string  `json:"email" validate:"required,email"`
	Phone       string  `json:"phone" validate:"required,vnphone"`
	JourneyID   *string `json:"journey_id" validate:"omitempty,uuid"`
	Message     string  `json:"message" validate:"required,min=10,max=4000"`
	BudgetRange string  `json:"budget_range" validate:"omitempty,max=60"`
	TravelDate  string  `json:"travel_date" validate:"omitempty,datetime=2006-01-02"`
	// Website is a honeypot. Real visitors never see or fill it.
	Website string `json:"website" validate:"omitempty"`
	// CaptchaToken is the signed math-challenge token; CaptchaAnswer is the sum.
	CaptchaToken  string `json:"captcha_token" validate:"omitempty,max=4000"`
	CaptchaAnswer string `json:"captcha_answer" validate:"omitempty,max=12"`
}

// inquiryValidationMessage turns validator errors into a friendly Vietnamese
// message keyed on the first failing field, so visitors get actionable feedback.
func inquiryValidationMessage(err error) string {
	var verrs validator.ValidationErrors
	if !errors.As(err, &verrs) || len(verrs) == 0 {
		return "Thông tin chưa hợp lệ, vui lòng kiểm tra lại."
	}
	switch verrs[0].Field() {
	case "Name":
		return "Vui lòng nhập họ tên (2–120 ký tự)."
	case "Email":
		return "Email không đúng định dạng, vui lòng kiểm tra lại."
	case "Phone":
		return "Số điện thoại không hợp lệ. Dùng số di động Việt Nam, ví dụ 0901234567 hoặc +84901234567."
	case "Message":
		return "Lời nhắn cần ít nhất 10 ký tự."
	default:
		return "Thông tin chưa hợp lệ, vui lòng kiểm tra lại."
	}
}

// captchaChallenge issues a fresh "add two numbers" challenge for the form.
func (h *Handler) captchaChallenge(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": h.svc.Inquiry.NewCaptcha()})
}

func (h *Handler) createInquiry(w http.ResponseWriter, r *http.Request) {
	var req inquiryRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "Malformed JSON body.")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "validation_failed", inquiryValidationMessage(err))
		return
	}

	// Store the phone in a clean, canonical form.
	req.Phone = normalizePhone(req.Phone)

	var travelDate *time.Time
	if req.TravelDate != "" {
		t, err := time.Parse("2006-01-02", req.TravelDate)
		if err != nil {
			writeError(w, http.StatusUnprocessableEntity, "validation_failed", "Invalid travel_date.")
			return
		}
		travelDate = &t
	}

	ctx, cancel := reqCtx(r)
	defer cancel()

	iq, err := h.svc.Inquiry.Create(ctx, service.InquiryInput{
		Name:          req.Name,
		Email:         req.Email,
		Phone:         req.Phone,
		JourneyID:     req.JourneyID,
		Message:       req.Message,
		BudgetRange:   req.BudgetRange,
		TravelDate:    travelDate,
		Honeypot:      req.Website,
		CaptchaToken:  req.CaptchaToken,
		CaptchaAnswer: req.CaptchaAnswer,
		RemoteIP:      clientIP(r),
	})
	switch {
	case errors.Is(err, service.ErrSpam):
		// Pretend success so bots get no signal.
		writeJSON(w, http.StatusAccepted, map[string]any{"data": map[string]string{"status": "received"}})
		return
	case errors.Is(err, service.ErrCaptcha):
		writeError(w, http.StatusUnprocessableEntity, "captcha_failed", "Xác thực chống robot thất bại, vui lòng thử lại.")
		return
	case errors.Is(err, service.ErrInvalidJourney):
		writeError(w, http.StatusUnprocessableEntity, "validation_failed", "Selected journey does not exist.")
		return
	case err != nil:
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not submit inquiry.")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"data": map[string]any{"id": iq.ID, "status": iq.Status},
	})
}
