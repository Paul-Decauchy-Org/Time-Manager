package middlewares

import (
	"os"
	"time"
	"context"
	"net/http"
	"github.com/dgrijalva/jwt-go"
)

var JWTSecret = []byte(os.Getenv("JWT_SECRET"))
type contextKey string

func GenerateToken(email string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)

	claims["email"] = email
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	tokenString, err := token.SignedString(JWTSecret)

	if err != nil {
		return "", err
	}
	return tokenString, nil

}

func ValidateToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func (token * jwt.Token) (any, error) {
		return JWTSecret, nil
	})
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		email := claims["email"].(string)
		return email, nil
	} else {
		return "", err
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
        email, err := ValidateToken(tokenString)
        if err != nil {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        ctx := context.WithValue(r.Context(), contextKey("email"), email)
        r = r.WithContext(ctx)
        next.ServeHTTP(w, r)
    })
}	

