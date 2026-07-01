# ---- build stage ----
FROM golang:1.22-alpine AS build
WORKDIR /src

# Resolve dependencies. go.sum is generated here if absent.
ENV GOFLAGS=-mod=mod
COPY go.mod ./
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/api  ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/seed ./cmd/seed

# Pre-create the uploads dir so a fresh named volume inherits nonroot ownership.
# (distroless has no shell, so we stage the dir here and COPY --chown it in.)
RUN mkdir -p /out/uploads

# ---- runtime stage (distroless) ----
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=build /out/api  /app/api
COPY --from=build /out/seed /app/seed
# Owned by nonroot (uid 65532) so the API can write uploaded images.
COPY --from=build --chown=nonroot:nonroot /out/uploads /app/uploads
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/api"]
