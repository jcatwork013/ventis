package handler

import (
	"encoding/json"
	"log"
	"net/http"
)

// meta is the pagination envelope returned with list responses.
type meta struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`
}

// listEnvelope wraps paginated collections.
type listEnvelope struct {
	Data any   `json:"data"`
	Meta meta  `json:"meta"`
}

// apiError is the unified error envelope: {"error":{"code","message"}}.
type apiError struct {
	Error errBody `json:"error"`
}

type errBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("[http] encode error: %v", err)
	}
}

func writeData(w http.ResponseWriter, status int, data any) {
	writeJSON(w, status, map[string]any{"data": data})
}

func writeList(w http.ResponseWriter, data any, page, limit, total int) {
	writeJSON(w, http.StatusOK, listEnvelope{Data: data, Meta: meta{Page: page, Limit: limit, Total: total}})
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, apiError{Error: errBody{Code: code, Message: message}})
}
