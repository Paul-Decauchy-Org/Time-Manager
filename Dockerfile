FROM golang:1.25.1

WORKDIR /app

RUN go mod init PLACEHOLDER.go && go mod tidy

COPY go.mod go.sum ./ 

COPY . .

CMD ["run", "go", "PLACEHOLDER.go"]

EXPOSE 8080