# Deadpool - Celebrity Draft Game Frontend

A web application for managing a celebrity draft game where players pick celebrities and score points based on outcomes throughout the year.

## Features

- Player Management: Add, edit, and remove players
- Celebrity Picks: Track celebrity selections for each player
- Leaderboard: Real-time standings and scores
- Draft Interface: Facilitate the draft process between players

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- Axios for API communication

## Project Structure

```text
src/
├── components/        # Reusable UI components
├── features/         # Feature-specific components
│   ├── players/      # Player management
│   ├── picks/        # Celebrity picks tracking
│   ├── leaderboard/  # Standings and scores
│   └── draft/        # Draft interface
├── layouts/          # Layout components
└── assets/          # Static assets
```

## Development

1. Install dependencies:

    ```bash
    npm install
    ```

1. Start development server:

    ```bash
    npm run dev
    ```

1. Build for production:

    ```bash
    npm run build
    ```

## Deployment

This application is designed to be hosted on AWS S3 as a static website. To deploy:

1. Build the application:

    ```bash
    npm run build
    ```

1. Upload the contents of the `dist` directory to your S3 bucket
1. Configure the S3 bucket for static website hosting
1. Set up CloudFront distribution (recommended for HTTPS and better performance)

## Backend Integration

The frontend is designed to work with a serverless backend built with:

- AWS Lambda
- API Gateway
- DynamoDB

API endpoints will be configured in a separate environment configuration file when the backend is ready.

## Contributing

1. Fork the repository
1. Create a feature branch
1. Commit your changes
1. Push to the branch
1. Create a Pull Request

## Deploy Production

```bash
Local development using npm run dev
Production builds using npm run build:prod
Deployment to AWS using npm run deploy:prod
```

## AWS Cognito

```bash
npm install oidc-client-ts react-oidc-context --save
```
