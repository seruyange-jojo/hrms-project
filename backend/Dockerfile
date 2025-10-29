# Build stage
FROM golang:1.21-alpine AS builder

# Install git and ca-certificates (needed for go mod download)
RUN apk update && apk add --no-cache git ca-certificates && update-ca-certificates

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download
RUN go mod verify

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS calls
RUN apk --no-cache add ca-certificates tzdata wget

# Create a non-root user
RUN addgroup -g 1001 -S hrms && \
    adduser -S hrms -u 1001

WORKDIR /home/hrms

# Copy the binary from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# Change ownership to hrms user
RUN chown -R hrms:hrms /home/hrms
USER hrms

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./main"]