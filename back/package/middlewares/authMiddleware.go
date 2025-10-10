package middlewares

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var JWTSecret = []byte(os.Getenv("JWT_SECRET"))
type contextKey string

func GenerateToken(email string, id string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)

	claims["email"] = email
	claims["id"] = id
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	tokenString, err := token.SignedString(JWTSecret)

	if err != nil {
		return "", err
	}
	return tokenString, nil

}

func ValidateToken(tokenString string) (string, string, error) {
	token, err := jwt.Parse(tokenString, func (token * jwt.Token) (any, error) {
		return JWTSecret, nil
	})
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		email := claims["email"].(string)
		id := claims["id"].(string)
		return email, id, nil
	} else {
		return "", "", err
	}
}


func AuthRequired(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        var tokenString string
        cookie, err := r.Cookie("token")
        if err == nil {
            tokenString = cookie.Value
        } else {
            tokenString = r.Header.Get("Authorization")
        }

        if tokenString == "" {
            http.Error(w, "Authorization header or cookie missing", http.StatusUnauthorized)
            return
        }
        email, id, err := ValidateToken(tokenString)
        if err != nil {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
		ctx := context.WithValue(r.Context(), contextKey("email"), email)
		ctx = context.WithValue(ctx, contextKey("id"), id)
        r = r.WithContext(ctx)
        next.ServeHTTP(w, r)
    })
}	

