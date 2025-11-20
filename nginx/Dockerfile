# Build a versioned Nginx image carrying the project nginx.conf
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# No CMD override; use upstream default