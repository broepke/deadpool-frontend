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

# # Invalidate CloudFront cache if distribution ID is provided
# if [ ! -z "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ]; then
#   echo "🔄 Invalidating CloudFront cache..."
#   aws cloudfront create-invalidation \
#     --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION_ID \
#     --paths "/*" \
#     --region $AWS_REGION
# fi

echo "✅ Deployment completed successfully!"

# # Print URLs
# echo "📱 Application URLs:"
# echo "S3 URL: http://$AWS_S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
# if [ ! -z "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ]; then
#   CLOUDFRONT_URL=$(aws cloudfront get-distribution --id $AWS_CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text --region $AWS_REGION)
#   echo "CloudFront URL: https://$CLOUDFRONT_URL"
# fi