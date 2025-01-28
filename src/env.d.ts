/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENV: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_RETRY_ATTEMPTS: string;
  readonly VITE_ENABLE_MOCK_API: string;
  readonly VITE_ENABLE_DEBUG_TOOLS: string;
  readonly VITE_COGNITO_AUTHORITY: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_COGNITO_REDIRECT_URI: string;
  readonly VITE_COGNITO_SCOPE: string;
  readonly VITE_COGNITO_DOMAIN: string;
  readonly VITE_COGNITO_LOGOUT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}