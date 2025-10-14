FROM golang:1.25.1

WORKDIR /app

RUN go mod init cmd/main.go && go mod tidy

COPY go.mod go.sum ./ 

COPY . .

CMD ["go", "run", "cmd/main.go"]

EXPOSE 8084