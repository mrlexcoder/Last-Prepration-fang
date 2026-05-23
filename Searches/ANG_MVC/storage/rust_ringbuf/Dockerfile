FROM rust:1.78-slim AS builder
WORKDIR /app
COPY Cargo.toml .
COPY src/ src/
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/ang_ringbuf /usr/local/bin/ang_ringbuf
EXPOSE 8090
CMD ["ang_ringbuf"]
