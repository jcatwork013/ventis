package captcha

import (
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"
)

// answerFor solves the question "a + b" embedded in a challenge.
func answerFor(t *testing.T, q string) string {
	t.Helper()
	parts := strings.Split(q, "+")
	if len(parts) != 2 {
		t.Fatalf("unexpected question %q", q)
	}
	a, _ := strconv.Atoi(strings.TrimSpace(parts[0]))
	b, _ := strconv.Atoi(strings.TrimSpace(parts[1]))
	return strconv.Itoa(a + b)
}

func TestMathRoundTrip(t *testing.T) {
	m := NewMath("secret", time.Minute)
	c := m.Issue()
	if !m.Verify(c.Token, answerFor(t, c.Question)) {
		t.Fatalf("correct answer rejected for %q", c.Question)
	}
}

func TestMathWrongAnswer(t *testing.T) {
	m := NewMath("secret", time.Minute)
	c := m.Issue()
	correct, _ := strconv.Atoi(answerFor(t, c.Question))
	if m.Verify(c.Token, strconv.Itoa(correct+1)) {
		t.Fatal("wrong answer accepted")
	}
}

func TestMathRejectsTamperedToken(t *testing.T) {
	m := NewMath("secret", time.Minute)
	c := m.Issue()
	ans := answerFor(t, c.Question)
	// Flip the last character of the signature.
	bad := c.Token[:len(c.Token)-1] + "X"
	if m.Verify(bad, ans) {
		t.Fatal("tampered signature accepted")
	}
}

func TestMathRejectsForeignSecret(t *testing.T) {
	issuer := NewMath("secret-A", time.Minute)
	attacker := NewMath("secret-B", time.Minute)
	c := issuer.Issue()
	if attacker.Verify(c.Token, answerFor(t, c.Question)) {
		t.Fatal("token forged under a different secret was accepted")
	}
}

func TestMathRejectsExpired(t *testing.T) {
	m := &Math{secret: []byte("secret"), ttl: time.Minute}
	// Hand-craft a properly signed token that expired one hour ago.
	payload := fmt.Sprintf("%d:%d:%d", time.Now().Add(-time.Hour).Unix(), 9, 1)
	token := base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + m.sign(payload)
	if m.Verify(token, "9") {
		t.Fatal("expired challenge accepted")
	}
}

func TestMathRejectsGarbage(t *testing.T) {
	m := NewMath("secret", time.Minute)
	for _, tok := range []string{"", "nodot", "a.b.c", "!!.??"} {
		if m.Verify(tok, "5") {
			t.Fatalf("garbage token %q accepted", tok)
		}
	}
}
