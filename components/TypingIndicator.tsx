
import React from 'react';
import { BotIcon } from './Icons';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4 my-4">
       <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <BotIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </div>
      <div className="max-w-2xl px-5 py-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800 rounded-bl-none flex items-center space-x-2">
        <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default TypingIndicator;
