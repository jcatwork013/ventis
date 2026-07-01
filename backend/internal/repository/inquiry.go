package repository

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"artjourneys/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type InquiryRepo struct{ pool *pgxpool.Pool }

// CreateInquiry holds the validated input needed to persist a lead.
type CreateInquiry struct {
	Name        string
	Email       string
	Phone       string
	JourneyID   *string
	Message     string
	BudgetRange string
	TravelDate  *time.Time
}

// InquiryFilter narrows the admin inbox by status and free-text search.
type InquiryFilter struct {
	Status string // empty = any
	Query  string // matched against name/email/phone/message
}

// InquiryStatuses are the statuses an admin may assign to a lead.
var InquiryStatuses = []string{"new", "read", "contacted", "archived"}

// ValidStatus reports whether s is an allowed inquiry status.
func ValidStatus(s string) bool {
	for _, v := range InquiryStatuses {
		if v == s {
			return true
		}
	}
	return false
}

// inquiryColumns is the shared SELECT list for a full inquiry row.
const inquiryColumns = `id, name, email, phone, journey_id, message, budget_range, travel_date, status, notes, created_at, updated_at`

func scanInquiry(row pgx.Row) (models.Inquiry, error) {
	var iq models.Inquiry
	err := row.Scan(&iq.ID, &iq.Name, &iq.Email, &iq.Phone, &iq.JourneyID, &iq.Message,
		&iq.BudgetRange, &iq.TravelDate, &iq.Status, &iq.Notes, &iq.CreatedAt, &iq.UpdatedAt)
	return iq, err
}

// Create inserts a new inquiry with status 'new' and returns the stored row.
func (r *InquiryRepo) Create(ctx context.Context, in CreateInquiry) (models.Inquiry, error) {
	return scanInquiry(r.pool.QueryRow(ctx,
		`INSERT INTO inquiries (name, email, phone, journey_id, message, budget_range, travel_date, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
		 RETURNING `+inquiryColumns,
		in.Name, in.Email, in.Phone, in.JourneyID, in.Message, in.BudgetRange, in.TravelDate,
	))
}

// where builds the dynamic WHERE clause + args shared by List and Export.
func (f InquiryFilter) where() (string, []any) {
	var conds []string
	var args []any
	if f.Status != "" {
		args = append(args, f.Status)
		conds = append(conds, "status = $"+strconv.Itoa(len(args)))
	}
	if q := strings.TrimSpace(f.Query); q != "" {
		args = append(args, "%"+q+"%")
		n := strconv.Itoa(len(args))
		conds = append(conds, "(name ILIKE $"+n+" OR email ILIKE $"+n+" OR phone ILIKE $"+n+" OR message ILIKE $"+n+")")
	}
	if len(conds) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conds, " AND "), args
}

// List returns inquiries newest-first (filtered) plus the total matched count.
func (r *InquiryRepo) List(ctx context.Context, f InquiryFilter, limit, offset int) ([]models.Inquiry, int, error) {
	where, args := f.where()

	var total int
	if err := r.pool.QueryRow(ctx, `SELECT count(*) FROM inquiries`+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, limit, offset)
	rows, err := r.pool.Query(ctx,
		`SELECT `+inquiryColumns+` FROM inquiries`+where+
			` ORDER BY created_at DESC LIMIT $`+strconv.Itoa(len(args)-1)+` OFFSET $`+strconv.Itoa(len(args)),
		args...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	out := make([]models.Inquiry, 0, limit)
	for rows.Next() {
		iq, err := scanInquiry(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, iq)
	}
	return out, total, rows.Err()
}

// Export returns every inquiry matching the filter, newest-first (for CSV).
func (r *InquiryRepo) Export(ctx context.Context, f InquiryFilter) ([]models.Inquiry, error) {
	where, args := f.where()
	rows, err := r.pool.Query(ctx,
		`SELECT `+inquiryColumns+` FROM inquiries`+where+` ORDER BY created_at DESC`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Inquiry
	for rows.Next() {
		iq, err := scanInquiry(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, iq)
	}
	return out, rows.Err()
}

// InquiryPatch carries the optional fields an admin can change on a lead.
// A nil pointer means "leave unchanged".
type InquiryPatch struct {
	Status *string
	Notes  *string
}

// Update applies a partial change (status and/or notes) and bumps updated_at.
// Returns ErrNotFound when no row matched.
func (r *InquiryRepo) Update(ctx context.Context, id string, p InquiryPatch) (models.Inquiry, error) {
	iq, err := scanInquiry(r.pool.QueryRow(ctx,
		`UPDATE inquiries
		    SET status     = COALESCE($2, status),
		        notes      = COALESCE($3, notes),
		        updated_at = now()
		  WHERE id = $1
		  RETURNING `+inquiryColumns,
		id, p.Status, p.Notes,
	))
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Inquiry{}, ErrNotFound
	}
	return iq, err
}

// Delete removes one inquiry. Returns ErrNotFound when nothing matched.
func (r *InquiryRepo) Delete(ctx context.Context, id string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM inquiries WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// InquiryStats summarises the inbox for the admin dashboard.
type InquiryStats struct {
	Total     int            `json:"total"`
	Last7Days int            `json:"last_7_days"`
	ByStatus  map[string]int `json:"by_status"`
}

// Stats returns aggregate counts across all inquiries.
func (r *InquiryRepo) Stats(ctx context.Context) (InquiryStats, error) {
	s := InquiryStats{ByStatus: map[string]int{}}
	for _, st := range InquiryStatuses {
		s.ByStatus[st] = 0
	}

	if err := r.pool.QueryRow(ctx,
		`SELECT count(*), count(*) FILTER (WHERE created_at >= now() - interval '7 days') FROM inquiries`,
	).Scan(&s.Total, &s.Last7Days); err != nil {
		return s, err
	}

	rows, err := r.pool.Query(ctx, `SELECT status, count(*) FROM inquiries GROUP BY status`)
	if err != nil {
		return s, err
	}
	defer rows.Close()
	for rows.Next() {
		var st string
		var n int
		if err := rows.Scan(&st, &n); err != nil {
			return s, err
		}
		s.ByStatus[st] = n
	}
	return s, rows.Err()
}
