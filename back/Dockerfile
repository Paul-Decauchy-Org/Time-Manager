FROM golang:1.25.1

WORKDIR /cmd

RUN go mod init main.go && go mod tidy

COPY go.mod go.sum ./ 

COPY . .

CMD ["run", "go", "main.go"]

EXPOSE 8080