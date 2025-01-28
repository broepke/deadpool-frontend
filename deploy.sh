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

# Check required Amplify environment variables
if [ -z "$AMPLIFY_APP_ID" ]; then
  echo "❌ AMPLIFY_APP_ID is not set in .env.production"
  exit 1
fi

if [ -z "$AMPLIFY_BRANCH" ]; then
  echo "❌ AMPLIFY_BRANCH is not set in .env.production"
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

# Create a zip file of the build
echo "📦 Creating deployment package..."
cd dist
zip -r ../deployment.zip ./*
cd ..

# Upload the zip to S3
echo "📤 Uploading deployment package to S3..."
aws s3 cp deployment.zip s3://$AWS_S3_BUCKET/deployments/deployment.zip \
  --region $AWS_REGION

# Trigger Amplify deployment
echo "🔄 Triggering Amplify deployment..."
aws amplify start-deployment \
  --app-id $AMPLIFY_APP_ID \
  --branch-name $AMPLIFY_BRANCH \
  --source-url s3://$AWS_S3_BUCKET/deployments/deployment.zip \
  --region $AWS_REGION

# Clean up
rm deployment.zip

echo "✅ Deployment completed successfully!"
