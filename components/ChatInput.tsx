
import React, { useState, useRef } from 'react';
import { SendIcon, PaperclipIcon, XCircleIcon, StopIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onCancel }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || file) && !isLoading) {
      onSendMessage(text, file as File | undefined);
      setText('');
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        {file && (
          <div className="mb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <PaperclipIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
            </div>
            <button onClick={removeFile} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Remove file">
              <XCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,text/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.py,.js,.html,.css,.java,.c,.cpp,.go,.rs"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Attach file"
          >
            <PaperclipIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question or upload a file..."
            disabled={isLoading}
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-shadow"
            autoFocus
          />
          <button
            type={isLoading ? "button" : "submit"}
            onClick={isLoading ? onCancel : undefined}
            disabled={!isLoading && (!text.trim() && !file)}
            className={`text-white rounded-full p-3 transition-colors ${
              isLoading 
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
            aria-label={isLoading ? "Stop generation" : "Send message"}
          >
            {isLoading ? <StopIcon className="h-6 w-6" /> : <SendIcon className="h-6 w-6" />}
          </button>
        </form>
      </div>
    </footer>
  );
};

export default ChatInput;
