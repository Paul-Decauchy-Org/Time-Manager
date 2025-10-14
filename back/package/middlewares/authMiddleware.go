package middlewares

import (
	"context"
	"net/http"
	"os"
	"time"
	"errors"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

var JWTSecret = []byte(os.Getenv("JWT_SECRET"))

type contextKey string

const (
	ContextUserIDKey    contextKey = "id"
	ContextUserEmailKey contextKey = "email"
	ContextUserERoleKey contextKey = "role"
)

func GenerateToken(email string, id string, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"id":    id,
		"role": role,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString(JWTSecret)
}

func ValidateToken(tokenString string) (string, string, string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return JWTSecret, nil
	})

	if err != nil || !token.Valid {
		return "", "", "", errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", "", errors.New("invalid claims")
	}

	email, _ := claims["email"].(string)
	id, _ := claims["id"].(string)
	role, _ := claims["role"].(string)
	return email, id, role, nil
}


func AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		
		ctx := context.WithValue(r.Context(), "ResponseWriter", w)

		var tokenString string
		authHeader := r.Header.Get("Authorization")

		if after, ok :=strings.CutPrefix(authHeader, "Bearer "); ok  {
			tokenString = after
		} else if cookie, err := r.Cookie("token"); err == nil {
			tokenString = cookie.Value
		}

		if tokenString == "" {
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		email, id, role, err := ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "Unauthorized: invalid token", http.StatusUnauthorized)
			return
		}

		ctx = context.WithValue(ctx, ContextUserEmailKey, email)
		ctx = context.WithValue(ctx, ContextUserIDKey, id)
		ctx = context.WithValue(ctx, ContextUserERoleKey, role)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

