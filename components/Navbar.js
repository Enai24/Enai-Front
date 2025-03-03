import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDarkMode(true);
    }
  };

  const navLinks = [
    { name: 'Discover Domain', path: '/dashboard/discover-domain' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Empty Brand Area */}
          <div className="flex-shrink-0 flex items-center">
            {/* Kept empty as per original design */}
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-200 bg-gray-800/50 hover:bg-gray-700/70 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm"
              >
                {link.name}
              </Link>
            ))}
            {/* User Greeting */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-4 ml-6">
                <span className="text-gray-100 font-medium bg-gray-800/50 px-4 py-2 rounded-xl shadow-sm">
                  Hello, {user.username}!
                </span>
              </div>
            )}
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 text-gray-300 hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ease-in-out transform hover:scale-110"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 text-gray-400 hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ease-in-out"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="-translate-y-full opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-150 transform"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-full opacity-0"
      >
        {(ref) => (
          <div className="md:hidden" id="mobile-menu">
            <div
              ref={ref}
              className="px-2 pt-2 pb-4 space-y-2 sm:px-3 bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-md shadow-md"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-200 bg-gray-800/50 hover:bg-gray-700/70 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm"
                >
                  {link.name}
                </Link>
              ))}
              {/* User Greeting */}
              {isAuthenticated && user && (
                <div className="mt-4">
                  <span className="block text-gray-100 font-medium bg-gray-800/50 px-4 py-3 rounded-xl shadow-sm">
                    Hello, {user.username}!
                  </span>
                </div>
              )}
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="mt-4 flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-gray-200 bg-gray-800/50 hover:bg-gray-700/70 hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <>
                    <SunIcon className="h-5 w-5 mr-3" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-5 w-5 mr-3" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Transition>
    </nav>
  );
};

export default Navbar;