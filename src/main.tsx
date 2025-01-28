import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import App from './App';
import './index.css';

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
  response_type: 'code',
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  loadUserInfo: true,
  monitorSession: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  onSignoutCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
  },
  metadata: {
    issuer: import.meta.env.VITE_COGNITO_AUTHORITY,
    authorization_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/authorize`,
    token_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`,
    end_session_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/logout`,
    userinfo_endpoint: `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/userInfo`,
    jwks_uri: `${import.meta.env.VITE_COGNITO_AUTHORITY}/.well-known/jwks.json`
  },
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  extraQueryParams: {
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
