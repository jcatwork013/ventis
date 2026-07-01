// Package captcha provides a lightweight, self-hosted "add two numbers"
// challenge. No third-party service, no client script, no dashboard config —
// just enough friction to stop naive spam bots. It is signed with HMAC so the
// answer can be verified statelessly (no Redis/DB round-trip), and pairs with
// the form honeypot and per-IP rate limiting for layered defence.
package captcha

import (
	"crypto/hmac"
	cryptorand "crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"
)

// Challenge is a math question handed to the browser. The client shows
// Question, the visitor types the sum, and Token is submitted back unchanged
// alongside that answer.
type Challenge struct {
	Question string `json:"question"` // e.g. "7 + 5"
	Token    string `json:"token"`    // opaque, signed; carries the expected answer + expiry
}

// Verifier issues math challenges and validates their answers.
type Verifier interface {
	Issue() Challenge
	Verify(token, answer string) bool
}

// Math is a stateless HMAC-signed arithmetic captcha.
type Math struct {
	secret []byte
	ttl    time.Duration
}

// NewMath builds a math captcha verifier. secret signs the tokens (reuse the
// app's JWT/secret key); ttl bounds how long a challenge stays valid.
func NewMath(secret string, ttl time.Duration) *Math {
	if strings.TrimSpace(secret) == "" {
		secret = "ventis-captcha-fallback-secret"
	}
	if ttl <= 0 {
		ttl = 10 * time.Minute
	}
	return &Math{secret: []byte(secret), ttl: ttl}
}

// Issue returns a fresh "a + b" challenge with a signed token.
func (m *Math) Issue() Challenge {
	a := randInt(8) + 1 // 1..9
	b := randInt(8) + 1 // 1..9
	exp := time.Now().Add(m.ttl).Unix()
	nonce := randInt(1 << 30) // makes each token unique even for identical sums
	payload := fmt.Sprintf("%d:%d:%d", exp, a+b, nonce)
	token := base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + m.sign(payload)
	return Challenge{Question: fmt.Sprintf("%d + %d", a, b), Token: token}
}

// Verify reports whether answer solves the challenge encoded in token: the
// signature must be valid, the challenge unexpired, and the sum correct.
func (m *Math) Verify(token, answer string) bool {
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return false
	}
	raw, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return false
	}
	payload := string(raw)
	if !hmac.Equal([]byte(m.sign(payload)), []byte(parts[1])) {
		return false
	}

	fields := strings.Split(payload, ":")
	if len(fields) != 3 {
		return false
	}
	exp, err := strconv.ParseInt(fields[0], 10, 64)
	if err != nil || time.Now().Unix() > exp {
		return false
	}
	want, err := strconv.Atoi(fields[1])
	if err != nil {
		return false
	}
	got, err := strconv.Atoi(strings.TrimSpace(answer))
	if err != nil {
		return false
	}
	return got == want
}

func (m *Math) sign(msg string) string {
	mac := hmac.New(sha256.New, m.secret)
	mac.Write([]byte(msg))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

// randInt returns a uniform integer in [0, n) using crypto/rand.
func randInt(n int) int {
	if n <= 0 {
		return 0
	}
	v, err := cryptorand.Int(cryptorand.Reader, big.NewInt(int64(n)))
	if err != nil {
		return 0
	}
	return int(v.Int64())
}
