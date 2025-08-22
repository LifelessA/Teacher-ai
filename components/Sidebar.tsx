
import React from 'react';
import { ChatSession } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onClose }) => {
    
    const handleDelete = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if(confirm('Are you sure you want to delete this chat?')) {
            onDeleteChat(chatId);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <aside
                className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Chat
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul className="p-2 space-y-1">
                        {chats.map(chat => (
                            <li key={chat.id}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelectChat(chat.id);
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                    className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeChatId === chat.id
                                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="truncate">{chat.title}</span>
                                    <button 
                                        onClick={(e) => handleDelete(e, chat.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-opacity"
                                        aria-label="Delete chat"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;