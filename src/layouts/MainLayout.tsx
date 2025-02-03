import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'react-oidc-context';
import { useAnalytics } from '../services/analytics/provider';

interface NavItem {
  name: string;
  href?: string;
}

interface NavLink extends NavItem {
  href: string;
}

interface NavMenu extends NavItem {
  type: 'menu';
  items: NavLink[];
}

type NavigationItem = NavLink | NavMenu;

const navigation: NavigationItem[] = [
  { name: 'Draft', href: '/draft' },
  { name: 'Leaderboard', href: '/leaderboard' },
  {
    name: 'Picks',
    type: 'menu',
    items: [
      { name: 'All Picks', href: '/picks' },
      { name: 'Pick Counts', href: '/picks/counts' }
    ]
  },
  { name: 'Players', href: '/players' },
  { name: 'People', href: '/people' },
];

export default function MainLayout() {
  const auth = useAuth();
  const analytics = useAnalytics();
  const location = useLocation();

  // Track page views
  useEffect(() => {
    analytics.trackPageView({
      path: location.pathname,
      title: document.title
    });
  }, [location, analytics]);

  const handleSignOut = async () => {
    // Track sign out event before clearing user data
    analytics.trackEvent('USER_LOGOUT', {
      email: auth.user?.profile.email
    });

    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    const authority = import.meta.env.VITE_COGNITO_AUTHORITY;
    
    try {
      // First remove user from auth context to prevent any authenticated requests
      auth.removeUser();

      // Clear OIDC tokens from localStorage and sessionStorage
      const oidcKey = `oidc.user:${authority}:${clientId}`;
      localStorage.removeItem(oidcKey);
      sessionStorage.removeItem(oidcKey);

      // Clear all cookies by setting their expiration to the past
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Finally redirect to Cognito logout
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    } catch (error) {
      console.error('Error during sign out:', error);
      // Fallback: force reload to clear everything
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
                      Deadpool
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        'type' in item && item.type === 'menu' ? (
                          <Menu as="div" key={item.name} className="relative">
                            <Menu.Button className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                              {item.name}
                            </Menu.Button>
                            <Transition
                              as={React.Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {item.items.map((subItem) => (
                                  <Menu.Item key={subItem.name}>
                                    {({ active }) => (
                                      <Link
                                        to={subItem.href}
                                        className={`${
                                          active ? 'bg-gray-100' : ''
                                        } block px-4 py-2 text-sm text-gray-700`}
                                      >
                                        {subItem.name}
                                      </Link>
                                    )}
                                  </Menu.Item>
                                ))}
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        ) : (
                          <Link
                            key={item.name}
                            to={item.href as string}
                            className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                          >
                            {item.name}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <UserCircleIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
                    </Menu.Button>
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 min-w-[12rem] max-w-xs origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b truncate" title={auth.user?.profile.email}>
                          {auth.user?.profile.email}
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
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
                  'type' in item && item.type === 'menu' ? (
                    <div key={item.name} className="space-y-1">
                      <div className="text-gray-500 px-3 py-2 text-base font-medium">
                        {item.name}
                      </div>
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-6 py-2 text-base font-medium"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href as string}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white truncate max-w-[calc(100vw-4rem)]" title={auth.user?.profile.email}>
                       {auth.user?.profile.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/profile"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white w-full text-left"
                  >
                    Sign out
                  </button>
                </div>
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
