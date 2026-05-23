FROM golang:1.22-alpine AS builder
WORKDIR /app

# Install protoc + plugins
RUN apk add --no-cache protobuf protobuf-dev git
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.1
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0

COPY go.mod .
RUN go mod download
COPY . .

# Generate proto stubs then build
RUN protoc \
    --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    proto/ang_store.proto

RUN go build -ldflags="-s -w" -o ang_store .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/ang_store /usr/local/bin/ang_store
EXPOSE 50051
CMD ["ang_store"]
