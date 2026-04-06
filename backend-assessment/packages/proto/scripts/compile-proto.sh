#!/bin/bash

set -e

echo "🔧 Compiling Protocol Buffers..."

PROTO_DIR="./proto"
OUT_DIR="./dist"

mkdir -p $OUT_DIR

# Compile user.proto
echo "   📄 Compiling user.proto..."
npx protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=$OUT_DIR \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=addGrpcMetadata=true \
  --ts_proto_opt=esModuleInterop=true \
  --proto_path=$PROTO_DIR \
  user.proto

# Compile wallet.proto
echo "   📄 Compiling wallet.proto..."
npx protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=$OUT_DIR \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=addGrpcMetadata=true \
  --ts_proto_opt=esModuleInterop=true \
  --proto_path=$PROTO_DIR \
  wallet.proto

echo "✅ Proto compilation complete!"
