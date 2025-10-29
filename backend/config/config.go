package config

import (
	"os"
	"time"
)

type Config struct {
	Port           string
	GinMode        string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	JWTSecret      string
	JWTExpiresIn   time.Duration
	AllowedOrigins string
}

func Load() *Config {
	jwtExpiresIn, _ := time.ParseDuration(getEnv("JWT_EXPIRES_IN", "24h"))

	return &Config{
		Port:           getEnv("PORT", "8080"),
		GinMode:        getEnv("GIN_MODE", "debug"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "hrms_user"),
		DBPassword:     getEnv("DB_PASSWORD", "hrms_password"),
		DBName:         getEnv("DB_NAME", "hrms_db"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		JWTSecret:      getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		JWTExpiresIn:   jwtExpiresIn,
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3001"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
