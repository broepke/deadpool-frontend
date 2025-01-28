import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import App from './App';
import './index.css';

const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_hprezMo06',
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  loadUserInfo: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
