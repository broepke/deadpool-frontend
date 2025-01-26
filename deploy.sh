#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Load environment variables from .env.production
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
else
  echo "❌ .env.production file not found"
  exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed. Please install it first."
  exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Sync build directory with S3 bucket
echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$AWS_S3_BUCKET \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html" \
  --region $AWS_REGION

# Upload index.html with no-cache headers
aws s3 cp dist/index.html s3://$AWS_S3_BUCKET/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --region $AWS_REGION

echo "✅ Deployment completed successfully!"
