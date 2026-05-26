#!/bin/bash
# build_c_bridge.sh
# Builds the pro-level C/C++ bridge for the ANC language

set -e

cd "$(dirname "$0")/c_bridge"

echo "[ANC] Building libanc.so (C bridge for direct OS + neural operations)..."

gcc -shared -fPIC -O3 \
    -Wall -Wextra \
    anc_c_bridge.c \
    -o libanc.so \
    -lrt -lpthread

echo "[ANC] Build complete: $(pwd)/libanc.so"

# Copy to runtime directory for easy loading
cp libanc.so ../runtime/libanc.so 2>/dev/null || true

echo "[ANC] C bridge ready for use by the AGI kernel."
