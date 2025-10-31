import React from 'react';
import { CricketBallIcon } from './Icons';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NavItem: React.FC<{
  label: string;
  viewName: string;
  currentView: string;
  onClick: (view: string) => void;
}> = ({ label, viewName, currentView, onClick }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => onClick(viewName)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
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
  return (
    <header className="bg-slate-800 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CricketBallIcon className="h-8 w-8 text-green-500" />
            <span className="ml-3 text-xl font-bold text-white">Cricket with AI</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <NavItem label="Home" viewName="home" currentView={currentView} onClick={onNavigate} />
            <NavItem label="Live Match" viewName="scoring" currentView={currentView} onClick={onNavigate} />
            <NavItem label="AI Scheduler" viewName="scheduler" currentView={currentView} onClick={onNavigate} />
            <NavItem label="History" viewName="history" currentView={currentView} onClick={onNavigate} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;