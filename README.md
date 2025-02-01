# Deadpool - Celebrity Draft Game Frontend

A web application for managing a celebrity draft game where players pick celebrities and score points based on outcomes throughout the year.

## Prerequisites

- Node.js (LTS version recommended)
- npm
- AWS CLI installed and configured
- Access to AWS Amplify and S3

## Project Setup

1. Clone the repository
2. Install dependencies:

    ```bash
    npm install
    ```

3. Create environment files:
   - `.env.development` for local development
   - `.env.production` for production deployment

Required environment variables:

```bash
AMPLIFY_APP_ID=your_amplify_app_id
AMPLIFY_BRANCH=your_branch_name
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_aws_region
```

## Local Development

Start the development server:

```bash
npm run dev
```

Additional development commands:

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Check TypeScript types
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report

## Building the Application

Build commands for different environments:

- Development: `npm run build:dev`
- Production: `npm run build:prod`

To preview the build:

```bash
npm run preview
```

## Deployment

The application uses a streamlined deployment process through `deploy.sh`, which handles:

- Building the application
- Syncing with S3 bucket with proper cache headers
- Creating and uploading deployment package
- Triggering AWS Amplify deployment

### Development Deployment

```bash
npm run deploy:dev
```

### Production Deployment

```bash
npm run deploy:prod
```

The `deploy.sh` script will:

1. Check for required environment variables in `.env.production`
2. Verify AWS CLI installation
3. Build and deploy the application
4. Handle all S3 syncing and Amplify triggers automatically

If deployment fails, check:

- `.env.production` file exists with required variables
- AWS CLI is properly configured
- AWS credentials have necessary permissions
- AWS Amplify console for detailed error logs

## Project Structure

```text
src/
├── api/                                # API client and services
│   ├── client.ts                       # Base API client configuration
│   ├── services/                       # Service-specific API endpoints
│   └── types.ts                        # API type definitions
├── components/                         # Reusable UI components
│   └── common/                         # Shared components like LoadingSpinner
├── features/                           # Feature-specific components
│   ├── auth/                           # Authentication
│   ├── draft/                          # Draft interface
│   ├── leaderboard/                    # Standings and scores
│   ├── people/                         # People management
│   ├── picks/                          # Celebrity picks
│   ├── players/                        # Player management
│   └── profile/                        # User profile
├── layouts/                            # Layout components
├── services/                           # Core services
│   └── analytics/                      # Analytics integration with error tracking
├── utils/                              # Utility functions
└── docs/                               # Architecture documentation
    ├── adr-*.md                        # Architecture Decision Records
    └── loading-indicator-pattern.md    # UI patterns
```

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- Axios for API communication
- OIDC for authentication
- Mixpanel for analytics
- Vitest for testing

## Architecture Documentation

The project includes several Architecture Decision Records (ADRs) in the `docs/` directory:

- Admin Draft Mode Implementation
- Analytics Integration and Error Tracking
- Character Validation Approach
- Cross-Platform Architecture
- Loading Indicator Pattern

These documents provide detailed context and reasoning behind key architectural decisions.

## UI Patterns

### Loading Indicator

The application implements a standardized loading indicator pattern (`LoadingSpinner`) for consistent user experience during async operations. This pattern is documented in `docs/loading-indicator-pattern.md`.

### Analytics Integration

The analytics service provides:
- Automatic error tracking for API calls
- Configurable event tracking
- Type-safe analytics implementation

## Maintenance

### Dependency Updates

```bash
npm run reinstall  # Clean install of dependencies
```

### Type Checking

```bash
npm run type-check
```

### Testing

```bash
npm test          # Run tests
npm run test:coverage  # Generate coverage report
