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
  
  // Debug logging for auth state changes
  React.useEffect(() => {
    console.log('Auth state changed:', {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      user: auth.user,
      error: auth.error,
      activeNavigator: auth.activeNavigator,
      timestamp: new Date().toISOString()
    });
  }, [auth.isLoading, auth.isAuthenticated, auth.user, auth.error, auth.activeNavigator]);

  // Basic Cognito sign in
  const handleSignIn = async () => {
    try {
      await auth.signinRedirect();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  // Basic Cognito sign out
  const handleSignOut = async () => {
    try {
      await auth.signoutRedirect();
    } catch (error) {
      console.error('Logout error:', error);
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