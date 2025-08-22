
import React from 'react';
import { BookIcon, MenuIcon } from './Icons';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <button 
        onClick={onMenuClick}
        className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <MenuIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      <div className="flex items-center justify-center flex-1 md:flex-none">
          <BookIcon className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Teacher AI
          </h1>
      </div>
    </header>
  );
};

export default Header;
