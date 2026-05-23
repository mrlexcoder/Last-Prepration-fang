#!/usr/bin/env bash
# Generate Python gRPC stubs from proto definition
set -e
cd "$(dirname "$0")/.."

pip install grpcio-tools==1.63.0 protobuf==5.26.1 -q

python3 -m grpc_tools.protoc \
  -I storage/go_store \
  --python_out=storage/go_store \
  --grpc_python_out=storage/go_store \
  storage/go_store/proto/ang_store.proto

echo "✓ Python gRPC stubs generated at storage/go_store/proto/"
