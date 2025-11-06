import React, { useState } from 'react';
import { CricketBallIcon, MenuIcon, XIcon } from './Icons';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NavItem: React.FC<{
  label: string;
  viewName: string;
  currentView: string;
  onClick: (view: string) => void;
  isMobile?: boolean;
}> = ({ label, viewName, currentView, onClick, isMobile = false }) => {
  const isActive = currentView === viewName;
  const baseClasses = "font-medium rounded-md transition-colors duration-200";
  const mobileClasses = `block px-3 py-2 text-base ${baseClasses}`;
  const desktopClasses = `px-2 sm:px-3 py-2 text-xs sm:text-sm ${baseClasses}`;

  return (
    <button
      onClick={() => onClick(viewName)}
      className={`${isMobile ? mobileClasses : desktopClasses} ${
        isActive
          ? 'bg-green-500 text-white'
          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: "Home", viewName: "home" },
    { label: "Live Match", viewName: "scoring" },
    { label: "Players", viewName: "players" },
    { label: "AI Scheduler", viewName: "scheduler" },
    { label: "History", viewName: "history" },
  ];

  return (
    <header className="bg-slate-800 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CricketBallIcon className="h-8 w-8 text-green-500" />
            <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-white">Cricket with AI</span>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
            {navItems.map(item => (
              <NavItem key={item.viewName} {...item} currentView={currentView} onClick={onNavigate} />
            ))}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu, show/hide based on menu state. */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
               <NavItem key={item.viewName} {...item} currentView={currentView} onClick={handleNavClick} isMobile />
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
