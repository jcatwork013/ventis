package models

import "time"

// Destination is an art/culture travel location.
type Destination struct {
	ID        string    `json:"id"`
	Slug      string    `json:"slug"`
	Name      string    `json:"name"`
	Country   string    `json:"country"`
	City      string    `json:"city"`
	HeroImage string    `json:"hero_image"`
	Summary   string    `json:"summary"`
	BodyMD    string    `json:"body_md"`
	Lat       float64   `json:"lat"`
	Lng       float64   `json:"lng"`
	Published bool      `json:"published"`
	CreatedAt time.Time `json:"created_at"`
}

// Journey is a curated art travel itinerary.
type Journey struct {
	ID            string    `json:"id"`
	Slug          string    `json:"slug"`
	Title         string    `json:"title"`
	Subtitle      string    `json:"subtitle"`
	DestinationID string    `json:"destination_id"`
	DurationDays  int       `json:"duration_days"`
	PriceFrom     int       `json:"price_from"`
	Currency      string    `json:"currency"`
	HeroImage     string    `json:"hero_image"`
	Gallery       []string  `json:"gallery"`
	Highlights    []string  `json:"highlights"`
	BodyMD        string    `json:"body_md"`
	Theme         []string  `json:"theme"`
	Published     bool      `json:"published"`
	CreatedAt     time.Time `json:"created_at"`

	// Destination is populated on list/detail reads via a join.
	Destination *DestinationRef `json:"destination,omitempty"`
}

// DestinationRef is the lightweight destination shape embedded in a Journey.
type DestinationRef struct {
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	Country string `json:"country"`
	City    string `json:"city"`
}

// Story is an editorial article.
type Story struct {
	ID          string     `json:"id"`
	Slug        string     `json:"slug"`
	Title       string     `json:"title"`
	Excerpt     string     `json:"excerpt"`
	CoverImage  string     `json:"cover_image"`
	BodyMD      string     `json:"body_md"`
	Author      string     `json:"author"`
	PublishedAt *time.Time `json:"published_at"`
	Published   bool       `json:"published"`
}

// Partner is a collaborating institution or supplier.
type Partner struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	LogoURL  string `json:"logo_url"`
	Category string `json:"category"`
	Website  string `json:"website"`
}

// Inquiry is a captured lead / booking request.
type Inquiry struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	Phone       string     `json:"phone"`
	JourneyID   *string    `json:"journey_id"`
	Message     string     `json:"message"`
	BudgetRange string     `json:"budget_range"`
	TravelDate  *time.Time `json:"travel_date"`
	Status      string     `json:"status"`
	Notes       string     `json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// Admin is a back-office user who can edit content.
type Admin struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         string    `json:"role"` // master | admin
	CreatedAt    time.Time `json:"created_at"`
}
