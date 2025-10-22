import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Sickle-Cell Image Generator
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-200 text-lg ${
                isActive('/') ? 'text-primary-600' : 'text-primary-700 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`font-medium transition-colors duration-200 text-lg ${
                isActive('/how-it-works') ? 'text-primary-600' : 'text-primary-700 hover:text-primary-600'
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/process" 
              className={`font-medium transition-colors duration-200 text-lg ${
                isActive('/process') ? 'text-primary-600' : 'text-primary-700 hover:text-primary-600'
              }`}
            >
              Process Data
            </Link>
          </nav>
          
          <div className="md:hidden">
            <button className="text-primary-700 hover:text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;