package handler

import (
	"context"
	"crypto/rand"
	"encoding/csv"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"artjourneys/internal/auth"
	"artjourneys/internal/repository"
	"artjourneys/internal/service"

	"github.com/go-chi/chi/v5"
)

// --- auth middleware ---------------------------------------------------------

type ctxKey string

const claimsKey ctxKey = "admin_claims"

// requireAdmin rejects requests without a valid Bearer token and stashes the
// verified claims in the request context for downstream handlers.
func (h *Handler) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authz := r.Header.Get("Authorization")
		if !strings.HasPrefix(authz, "Bearer ") {
			writeError(w, http.StatusUnauthorized, "unauthorized", "Yêu cầu đăng nhập.")
			return
		}
		token := strings.TrimSpace(strings.TrimPrefix(authz, "Bearer "))
		claims, err := h.auth.Verify(token)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "unauthorized", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")
			return
		}
		ctx := context.WithValue(r.Context(), claimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// adminClaims returns the verified claims placed by requireAdmin.
func adminClaims(r *http.Request) *auth.Claims {
	c, _ := r.Context().Value(claimsKey).(*auth.Claims)
	return c
}

// --- login -------------------------------------------------------------------

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

func (h *Handler) adminLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16))
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "Dữ liệu không hợp lệ.")
		return
	}
	if err := h.validate.Struct(req); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "validation_failed", "Email hoặc mật khẩu chưa hợp lệ.")
		return
	}

	ctx, cancel := reqCtx(r)
	defer cancel()

	token, exp, admin, err := h.svc.Admin.Login(ctx, req.Email, req.Password)
	if errors.Is(err, service.ErrInvalidCredentials) {
		writeError(w, http.StatusUnauthorized, "invalid_credentials", "Email hoặc mật khẩu không đúng.")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể đăng nhập.")
		return
	}

	writeData(w, http.StatusOK, map[string]any{
		"token":      token,
		"expires_at": exp,
		"admin":      map[string]string{"email": admin.Email, "name": admin.Name, "role": admin.Role},
	})
}

// --- content -----------------------------------------------------------------

// publicContent serves the editable site document to the public site.
func (h *Handler) publicContent(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := reqCtx(r)
	defer cancel()
	raw, err := h.svc.Admin.Content(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load content.")
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_, _ = w.Write([]byte(`{"data":`))
	_, _ = w.Write(raw)
	_, _ = w.Write([]byte(`}`))
}

// adminSaveContent replaces the site document (admin only).
func (h *Handler) adminSaveContent(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "Nội dung quá lớn hoặc không hợp lệ.")
		return
	}
	ctx, cancel := reqCtx(r)
	defer cancel()
	if err := h.svc.Admin.SaveContent(ctx, body); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "validation_failed", err.Error())
		return
	}
	writeData(w, http.StatusOK, map[string]string{"status": "saved"})
}

// --- image upload ------------------------------------------------------------

var allowedImageExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true, ".avif": true, ".svg": true,
}

func (h *Handler) adminUpload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(12 << 20); err != nil { // 12MB
		writeError(w, http.StatusBadRequest, "invalid_body", "Không đọc được tệp tải lên.")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "no_file", "Vui lòng chọn một tệp ảnh.")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExt[ext] {
		writeError(w, http.StatusUnprocessableEntity, "bad_type", "Định dạng ảnh không được hỗ trợ.")
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể lưu ảnh.")
		return
	}
	name := randomName() + ext
	dst, err := os.Create(filepath.Join(h.uploadDir, name))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể lưu ảnh.")
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, io.LimitReader(file, 12<<20)); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể lưu ảnh.")
		return
	}

	url := h.publicURL + "/uploads/" + name
	writeData(w, http.StatusCreated, map[string]string{"url": url})
}

func randomName() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// adminListUploads returns previously uploaded images (newest first) so the
// admin can reuse an existing image from the media library instead of
// re-uploading. URLs mirror those returned by adminUpload.
func (h *Handler) adminListUploads(w http.ResponseWriter, _ *http.Request) {
	entries, err := os.ReadDir(h.uploadDir)
	if err != nil {
		if os.IsNotExist(err) {
			writeData(w, http.StatusOK, []string{})
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Không đọc được thư viện ảnh.")
		return
	}

	type item struct {
		url string
		mod time.Time
	}
	items := make([]item, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if !allowedImageExt[strings.ToLower(filepath.Ext(e.Name()))] {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		items = append(items, item{url: h.publicURL + "/uploads/" + e.Name(), mod: info.ModTime()})
	}
	sort.Slice(items, func(i, j int) bool { return items[i].mod.After(items[j].mod) })

	urls := make([]string, len(items))
	for i, it := range items {
		urls[i] = it.url
	}
	writeData(w, http.StatusOK, urls)
}

// --- inquiries ---------------------------------------------------------------

// inquiryFilter parses the status + search query params shared by the list and
// export endpoints. An unknown status is ignored (treated as "any").
func inquiryFilter(r *http.Request) repository.InquiryFilter {
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	if status != "" && !repository.ValidStatus(status) {
		status = ""
	}
	return repository.InquiryFilter{
		Status: status,
		Query:  strings.TrimSpace(r.URL.Query().Get("q")),
	}
}

func (h *Handler) adminInquiries(w http.ResponseWriter, r *http.Request) {
	page, limit := pagination(r)
	if limit > 100 {
		limit = 100
	}
	ctx, cancel := reqCtx(r)
	defer cancel()
	items, total, err := h.svc.Admin.Inquiries(ctx, inquiryFilter(r), limit, (page-1)*limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể tải danh sách liên hệ.")
		return
	}
	writeList(w, items, page, limit, total)
}

// adminUpdateInquiry changes a lead's status and/or admin notes.
func (h *Handler) adminUpdateInquiry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req struct {
		Status *string `json:"status"`
		Notes  *string `json:"notes"`
	}
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16))
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "Dữ liệu không hợp lệ.")
		return
	}
	if req.Status == nil && req.Notes == nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "Không có gì để cập nhật.")
		return
	}

	ctx, cancel := reqCtx(r)
	defer cancel()
	iq, err := h.svc.Admin.UpdateInquiry(ctx, id, req.Status, req.Notes)
	if errors.Is(err, service.ErrNotFound) {
		writeError(w, http.StatusNotFound, "not_found", "Không tìm thấy liên hệ.")
		return
	}
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, "validation_failed", err.Error())
		return
	}
	writeData(w, http.StatusOK, iq)
}

// adminDeleteInquiry permanently removes a lead.
func (h *Handler) adminDeleteInquiry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx, cancel := reqCtx(r)
	defer cancel()
	if err := h.svc.Admin.DeleteInquiry(ctx, id); err != nil {
		if errors.Is(err, service.ErrNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Không tìm thấy liên hệ.")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể xoá liên hệ.")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// adminExportInquiries streams the filtered inbox as a UTF-8 CSV download.
func (h *Handler) adminExportInquiries(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := reqCtx(r)
	defer cancel()
	items, err := h.svc.Admin.ExportInquiries(ctx, inquiryFilter(r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể xuất dữ liệu.")
		return
	}

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="ventis-lien-he.csv"`)
	// UTF-8 BOM so Excel renders Vietnamese correctly.
	_, _ = w.Write([]byte{0xEF, 0xBB, 0xBF})

	cw := csv.NewWriter(w)
	_ = cw.Write([]string{"Thời gian", "Tên", "Email", "Điện thoại", "Ngân sách", "Trạng thái", "Lời nhắn", "Ghi chú"})
	for _, iq := range items {
		_ = cw.Write([]string{
			iq.CreatedAt.Format(time.RFC3339),
			iq.Name, iq.Email, iq.Phone, iq.BudgetRange, iq.Status, iq.Message, iq.Notes,
		})
	}
	cw.Flush()
}

// --- dashboard ---------------------------------------------------------------

func (h *Handler) adminStats(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := reqCtx(r)
	defer cancel()
	stats, err := h.svc.Admin.Stats(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể tải thống kê.")
		return
	}
	writeData(w, http.StatusOK, stats)
}

// --- account -----------------------------------------------------------------

// adminMe returns the currently authenticated admin.
func (h *Handler) adminMe(w http.ResponseWriter, r *http.Request) {
	claims := adminClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Yêu cầu đăng nhập.")
		return
	}
	ctx, cancel := reqCtx(r)
	defer cancel()
	a, err := h.svc.Admin.GetAdmin(ctx, claims.AdminID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể tải tài khoản.")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"email": a.Email, "name": a.Name, "role": a.Role})
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

// adminChangePassword updates the authenticated admin's own password.
func (h *Handler) adminChangePassword(w http.ResponseWriter, r *http.Request) {
	claims := adminClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Yêu cầu đăng nhập.")
		return
	}

	var req changePasswordRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16))
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "Dữ liệu không hợp lệ.")
		return
	}
	if err := h.validate.Struct(req); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "validation_failed", "Mật khẩu mới phải có ít nhất 8 ký tự.")
		return
	}

	ctx, cancel := reqCtx(r)
	defer cancel()
	err := h.svc.Admin.ChangePassword(ctx, claims.AdminID, req.CurrentPassword, req.NewPassword)
	if errors.Is(err, service.ErrInvalidCredentials) {
		writeError(w, http.StatusUnauthorized, "invalid_credentials", "Mật khẩu hiện tại không đúng.")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Không thể đổi mật khẩu.")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"status": "changed"})
}
