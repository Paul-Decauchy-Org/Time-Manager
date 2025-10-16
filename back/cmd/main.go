package main

import (
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
	"github.com/epitech/timemanager/package/middlewares"
	"github.com/epitech/timemanager/services"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8084"

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
	adminRepo := repositories.NewRepository(db)
	authService := services.NewAuthService(authRepo)
	adminService := services.NewAdminService(adminRepo)
	resolver := &resolvers.Resolver{
		DB:           db,
		AuthService:  authService,
		AdminService: adminService,
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
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:8084"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		Debug:            true, // Remove in production
	})

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", c.Handler(middlewares.AuthRequired(srv)))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
