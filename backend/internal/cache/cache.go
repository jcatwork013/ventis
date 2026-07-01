package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache is a minimal string cache abstraction used for GET response caching.
type Cache interface {
	Get(ctx context.Context, key string) (string, bool)
	Set(ctx context.Context, key, value string, ttl time.Duration)
}

// Noop is a cache that stores nothing — used when Redis is not configured.
type Noop struct{}

func (Noop) Get(context.Context, string) (string, bool)            { return "", false }
func (Noop) Set(context.Context, string, string, time.Duration)    {}

// Redis is a Redis-backed Cache.
type Redis struct{ client *redis.Client }

// NewRedis builds a Redis cache from a connection URL (redis://...).
func NewRedis(url string) (*Redis, error) {
	opt, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	return &Redis{client: client}, nil
}

func (r *Redis) Get(ctx context.Context, key string) (string, bool) {
	v, err := r.client.Get(ctx, key).Result()
	if err != nil {
		return "", false
	}
	return v, true
}

func (r *Redis) Set(ctx context.Context, key, value string, ttl time.Duration) {
	_ = r.client.Set(ctx, key, value, ttl).Err()
}
