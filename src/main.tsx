import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from "react-oidc-context";
import App from './App';
import './index.css';

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
  response_type: "code",
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  loadUserInfo: true,
  metadata: {
    issuer: import.meta.env.VITE_COGNITO_AUTHORITY,
    jwks_uri: `${import.meta.env.VITE_COGNITO_DOMAIN}/.well-known/jwks.json`,
    authorization_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/authorize`,
    token_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`,
    userinfo_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/userInfo`,
    end_session_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/logout`
  },
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  onSigninError: (error: Error) => {
    console.error('Signin Error:', error);
  },
  onSignoutError: (error: Error) => {
    console.error('Signout Error:', error);
  }
};

// Log configuration for debugging
console.log('Auth Config:', {
  authority: cognitoAuthConfig.authority,
  redirect_uri: cognitoAuthConfig.redirect_uri,
  post_logout_redirect_uri: cognitoAuthConfig.post_logout_redirect_uri,
  scope: cognitoAuthConfig.scope,
  metadata: cognitoAuthConfig.metadata
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
