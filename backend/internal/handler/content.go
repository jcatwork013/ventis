package handler

import (
	"errors"
	"net/http"
	"time"

	"artjourneys/internal/repository"

	"github.com/go-chi/chi/v5"
)

func (h *Handler) listJourneys(w http.ResponseWriter, r *http.Request) {
	page, limit := pagination(r)
	f := repository.JourneyFilter{
		Theme:       r.URL.Query().Get("theme"),
		Destination: r.URL.Query().Get("destination"),
		Page:        page,
		Limit:       limit,
	}
	key := "journeys:" + f.Theme + ":" + f.Destination + ":" + r.URL.Query().Get("page") + ":" + r.URL.Query().Get("limit")

	h.cached(w, r, key, 60*time.Second, func() (any, error) {
		ctx, cancel := reqCtx(r)
		defer cancel()
		items, total, err := h.svc.Content.Journeys(ctx, f)
		if err != nil {
			return nil, err
		}
		return listEnvelope{Data: items, Meta: meta{Page: page, Limit: limit, Total: total}}, nil
	})
}

func (h *Handler) getJourney(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := reqCtx(r)
	defer cancel()
	j, err := h.svc.Content.Journey(ctx, chi.URLParam(r, "slug"))
	if err != nil {
		notFoundOrError(w, err)
		return
	}
	writeData(w, http.StatusOK, j)
}

func (h *Handler) listDestinations(w http.ResponseWriter, r *http.Request) {
	h.cached(w, r, "destinations:all", 120*time.Second, func() (any, error) {
		ctx, cancel := reqCtx(r)
		defer cancel()
		items, err := h.svc.Content.Destinations(ctx)
		if err != nil {
			return nil, err
		}
		return map[string]any{"data": items}, nil
	})
}

func (h *Handler) getDestination(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := reqCtx(r)
	defer cancel()
	d, journeys, err := h.svc.Content.Destination(ctx, chi.URLParam(r, "slug"))
	if err != nil {
		notFoundOrError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"data": map[string]any{"destination": d, "journeys": journeys},
	})
}

func (h *Handler) listStories(w http.ResponseWriter, r *http.Request) {
	page, limit := pagination(r)
	key := "stories:" + r.URL.Query().Get("page") + ":" + r.URL.Query().Get("limit")
	h.cached(w, r, key, 120*time.Second, func() (any, error) {
		ctx, cancel := reqCtx(r)
		defer cancel()
		items, total, err := h.svc.Content.Stories(ctx, page, limit)
		if err != nil {
			return nil, err
		}
		return listEnvelope{Data: items, Meta: meta{Page: page, Limit: limit, Total: total}}, nil
	})
}

func (h *Handler) getStory(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := reqCtx(r)
	defer cancel()
	s, err := h.svc.Content.Story(ctx, chi.URLParam(r, "slug"))
	if err != nil {
		notFoundOrError(w, err)
		return
	}
	writeData(w, http.StatusOK, s)
}

func (h *Handler) listPartners(w http.ResponseWriter, r *http.Request) {
	h.cached(w, r, "partners:all", 300*time.Second, func() (any, error) {
		ctx, cancel := reqCtx(r)
		defer cancel()
		items, err := h.svc.Content.Partners(ctx)
		if err != nil {
			return nil, err
		}
		return map[string]any{"data": items}, nil
	})
}

func notFoundOrError(w http.ResponseWriter, err error) {
	if errors.Is(err, repository.ErrNotFound) {
		writeError(w, http.StatusNotFound, "not_found", "Resource not found.")
		return
	}
	writeError(w, http.StatusInternalServerError, "internal_error", "Something went wrong.")
}
