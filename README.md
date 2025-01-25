# Deadpool Game Frontend

A React-based frontend application for managing and playing the Deadpool game. Players participate in a draft to pick celebrities, and scores are tracked on a yearly leaderboard.

## Features

- **Player Draft System**: Players can participate in a draft to pick celebrities
- **Leaderboard**: Track scores by year (2023 onwards)
- **Authentication**: Secure login system for players
- **Admin Panel**: Administrative interface for game management

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for API data fetching
- Axios for HTTP requests
- Tailwind CSS for styling

## Development

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

### Setup

1. Clone the repository
1. Install dependencies:

```bash
npm install
```

1. Create a `.env` file in the root directory with:

  ```bash
  VITE_API_URL=http://localhost:8000  # or your API endpoint
  ```

1. Start the development server:

  ```bash
  npm run dev
  ```

### Building for Production

```bash
npm run build
```

## Project Structure

- `/src/features/` - Main feature modules (admin, auth, draft, leaderboard)
- `/src/api/` - API configuration and endpoints
- `/src/components/` - Shared React components
- `/src/context/` - React context providers
- `/src/hooks/` - Custom React hooks
- `/src/utils/` - Utility functions
- `/src/types/` - TypeScript type definitions
