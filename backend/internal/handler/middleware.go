package handler

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// ipRateLimiter throttles requests per client IP. Used to protect the public
// POST /inquiries endpoint from spam (5 requests/minute/IP).
type ipRateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	rate     rate.Limit
	burst    int
}

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newIPRateLimiter(perMinute, burst int) *ipRateLimiter {
	l := &ipRateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate.Every(time.Minute / time.Duration(perMinute)),
		burst:    burst,
	}
	go l.cleanup()
	return l
}

func (l *ipRateLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	v, ok := l.visitors[ip]
	if !ok {
		lim := rate.NewLimiter(l.rate, l.burst)
		l.visitors[ip] = &visitor{limiter: lim, lastSeen: time.Now()}
		return lim
	}
	v.lastSeen = time.Now()
	return v.limiter
}

// cleanup evicts visitors that have been idle for 5 minutes.
func (l *ipRateLimiter) cleanup() {
	for {
		time.Sleep(time.Minute)
		l.mu.Lock()
		for ip, v := range l.visitors {
			if time.Since(v.lastSeen) > 5*time.Minute {
				delete(l.visitors, ip)
			}
		}
		l.mu.Unlock()
	}
}

// middleware returns an http.Handler wrapper that enforces the per-IP limit.
func (l *ipRateLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.get(clientIP(r)).Allow() {
			writeError(w, http.StatusTooManyRequests, "rate_limited", "Too many requests, please slow down.")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// clientIP resolves the caller IP, honoring X-Forwarded-For behind a proxy.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if i := indexByte(xff, ','); i >= 0 {
			return trim(xff[:i])
		}
		return trim(xff)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func indexByte(s string, b byte) int {
	for i := 0; i < len(s); i++ {
		if s[i] == b {
			return i
		}
	}
	return -1
}

func trim(s string) string {
	start, end := 0, len(s)
	for start < end && s[start] == ' ' {
		start++
	}
	for end > start && s[end-1] == ' ' {
		end--
	}
	return s[start:end]
}
