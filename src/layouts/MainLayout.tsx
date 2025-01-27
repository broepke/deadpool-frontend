import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from "react-oidc-context";

const navigation = [
  { name: 'Players', href: '/players' },
  { name: 'Picks', href: '/picks' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Draft', href: '/draft' },
];

export default function MainLayout() {
  const auth = useAuth();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  
  // Initial authentication check and token validation
  React.useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication state:', {
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        error: auth.error,
        activeNavigator: auth.activeNavigator,
        hasUser: !!auth.user,
        hasIdToken: !!auth.user?.id_token,
        hasAccessToken: !!auth.user?.access_token,
        signInStatus: auth.activeNavigator || auth.isLoading ? 'in-progress' : auth.isAuthenticated ? 'signed-in' : 'signed-out',
        timestamp: new Date().toISOString()
      });

      // Check for stored tokens
      const hasStoredTokens = localStorage.getItem('cognito.access_token') ||
                            localStorage.getItem('cognito.id_token');

      // If we have tokens but no user or not authenticated, try silent sign in
      if ((hasStoredTokens || auth.user) && !auth.isAuthenticated && !auth.isLoading) {
        try {
          console.log('Attempting silent sign in...');
          await auth.signinSilent();
          console.log('Silent sign in successful');
          setForceUpdate(prev => prev + 1);
        } catch (error) {
          console.error('Silent sign in failed:', error);
          // Clear stored tokens if silent sign in fails
          localStorage.removeItem('cognito.access_token');
          localStorage.removeItem('cognito.id_token');
          localStorage.removeItem('cognito.refresh_token');
        }
      }
    };

    checkAuth();
  }, [auth.isLoading, auth.isAuthenticated, auth.user, auth.error, auth.activeNavigator]);

  // Listen for auth completion event and handle token refresh
  React.useEffect(() => {
    const handleAuthComplete = () => {
      console.log('Auth complete event received');
      setForceUpdate(prev => prev + 1);
    };

    const handleTokenExpiring = () => {
      console.log('Token expiring, attempting refresh...');
      auth.signinSilent()
        .then(() => {
          console.log('Token refresh successful');
          setForceUpdate(prev => prev + 1);
        })
        .catch(error => {
          console.error('Token refresh failed:', error);
          // If refresh fails, try to get a new token
          handleSignIn();
        });
    };

    // Set up token expiring event listener
    if (auth.events) {
      auth.events.addAccessTokenExpiring(handleTokenExpiring);
    }

    window.addEventListener('auth_complete', handleAuthComplete);
    
    return () => {
      window.removeEventListener('auth_complete', handleAuthComplete);
      if (auth.events) {
        auth.events.removeAccessTokenExpiring(handleTokenExpiring);
      }
    };
  }, [auth.events]);

  // Check for redirect completion and process auth code
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      console.log('Processing authentication code...', {
        code: params.get('code')?.substring(0, 8) + '...',
        state: params.get('state'),
        error: params.get('error'),
        errorDescription: params.get('error_description'),
        timestamp: new Date().toISOString()
      });

      // If we have a code but no user, try silent sign in
      if (!auth.user && !auth.isLoading) {
        auth.signinSilent()
          .then(() => {
            console.log('Silent sign in after code successful');
            setForceUpdate(prev => prev + 1);
          })
          .catch(error => {
            console.error('Silent sign in after code failed:', error);
          });
      }
    }
  }, [auth.user, auth.isLoading]);

  // Handle sign in with comprehensive error handling and token validation
  const handleSignIn = async () => {
    console.log('Initiating sign in...', {
      timestamp: new Date().toISOString(),
      currentUrl: window.location.href,
      redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI
    });

    // Clear any existing tokens before starting new sign in
    localStorage.removeItem('cognito.access_token');
    localStorage.removeItem('cognito.id_token');
    localStorage.removeItem('cognito.refresh_token');

    try {
      // First check if we can do a silent sign in
      if (auth.user) {
        try {
          await auth.signinSilent();
          console.log('Silent sign in successful');
          setForceUpdate(prev => prev + 1);
          return;
        } catch (silentError) {
          console.log('Silent sign in not possible, proceeding with redirect');
        }
      }

      // Proceed with redirect sign in
      await auth.signinRedirect({
        redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
        extraQueryParams: {
          response_type: 'code',
          client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
          scope: 'openid email profile'
        }
      });
    } catch (error) {
      console.error('Sign in error:', {
        error,
        state: auth.user ? 'Has User' : 'No User',
        isAuthenticated: auth.isAuthenticated,
        timestamp: new Date().toISOString()
      });

      // If redirect fails, try one last silent sign in
      try {
        console.log('Attempting final silent sign in...');
        await auth.signinSilent();
        console.log('Final silent sign in successful');
        setForceUpdate(prev => prev + 1);
      } catch (finalError) {
        console.error('All sign in attempts failed:', finalError);
        // Clear any partial auth state
        auth.removeUser();
        localStorage.removeItem('cognito.access_token');
        localStorage.removeItem('cognito.id_token');
        localStorage.removeItem('cognito.refresh_token');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Initiating sign out...', {
        timestamp: new Date().toISOString(),
        hasUser: !!auth.user,
        isAuthenticated: auth.isAuthenticated
      });

      // First, remove the user locally
      await auth.removeUser();
      
      // Clear any stored tokens
      localStorage.removeItem('cognito.access_token');
      localStorage.removeItem('cognito.id_token');
      localStorage.removeItem('cognito.refresh_token');
      
      // Build the logout URL with all required parameters
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
        logout_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
        response_type: 'code'
      });
      
      // Redirect to Cognito logout using custom domain
      window.location.href = `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/logout?${params.toString()}`;
    } catch (error) {
      console.error('Logout error:', error);
      // Force a page reload as fallback
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link to="/" className="text-white font-bold text-xl">
                      DeadPool
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  {auth.isLoading ? (
                    <span className="text-gray-300">Loading...</span>
                  ) : auth.error ? (
                    <span className="text-red-400">Error: {auth.error.message}</span>
                  ) : auth.isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-300">{auth.user?.profile.email}</span>
                      <Link
                        to="/profile"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                    >
                      Sign in
                    </button>
                  )}
                </div>
                <div className="-mr-2 flex md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                {auth.isAuthenticated ? (
                  <>
                    <div className="text-gray-300 px-3 py-2">{auth.user?.profile.email}</div>
                    <Link
                      to="/profile"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left rounded-md px-3 py-2 text-base font-medium"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left rounded-md px-3 py-2 text-base font-medium"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}