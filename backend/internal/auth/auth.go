// Package auth provides password hashing and JWT issuing/verification for the
// admin area.
package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// ErrInvalidToken is returned when a token fails verification.
var ErrInvalidToken = errors.New("invalid token")

// Claims is the JWT payload for an authenticated admin.
type Claims struct {
	AdminID string `json:"sub"`
	Email   string `json:"email"`
	Role    string `json:"role"`
	jwt.RegisteredClaims
}

// HashPassword returns a bcrypt hash of the given plaintext.
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	return string(b), err
}

// CheckPassword reports whether plain matches the stored bcrypt hash.
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}

// Manager issues and validates tokens with a shared secret.
type Manager struct {
	secret []byte
	ttl    time.Duration
}

// NewManager builds a token manager. ttl is the token lifetime.
func NewManager(secret string, ttl time.Duration) *Manager {
	return &Manager{secret: []byte(secret), ttl: ttl}
}

// Issue creates a signed JWT for the given admin.
func (m *Manager) Issue(adminID, email, role string) (string, time.Time, error) {
	exp := time.Now().Add(m.ttl)
	claims := Claims{
		AdminID: adminID,
		Email:   email,
		Role:    role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   adminID,
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString(m.secret)
	return signed, exp, err
}

// Verify parses and validates a token, returning its claims.
func (m *Manager) Verify(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	tok, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return m.secret, nil
	})
	if err != nil || !tok.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}
