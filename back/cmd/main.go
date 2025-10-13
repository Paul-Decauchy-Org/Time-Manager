package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/epitech/timemanager/internal/graph"
	"github.com/epitech/timemanager/internal/graph/resolvers"
	"github.com/epitech/timemanager/internal/repositories"
	"github.com/epitech/timemanager/package/database"
	"github.com/epitech/timemanager/services"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8081"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Connexion à la base de données au démarrage (une seule fois)
	if err := database.Connect(); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Récupérer l'instance *gorm.DB pour fermer la connexion proprement au shutdown
	db, err := database.GetDB()
	if err != nil {
		log.Fatalf("failed to get database instance: %v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB from gorm.DB: %v", err)
	}
	defer func() {
		if err := sqlDB.Close(); err != nil {
			log.Printf("error closing database connection: %v", err)
		}
	}()

	authRepo := repositories.NewRepository(db)
	authService := services.NewAuthService(authRepo)
	resolver := &resolvers.Resolver{
		DB:          db,
		AuthService: authService,
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: resolver,
	}))
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"}, // Add your Next.js ports
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
		Debug:            true, // Remove in production
	})

	http.Handle("/", c.Handler(playground.Handler("GraphQL playground", "/query")))
	http.Handle("/query", c.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), "ResponseWriter", w)
		srv.ServeHTTP(w, r.WithContext(ctx))
	})))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
