import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Message, MessageRole, ContentPart, PartType, VisualPart } from '../types';
import { UserIcon, BotIcon, AlertTriangleIcon, CodeBracketIcon, SpeakerIcon, PaperclipIcon } from './Icons';

// --- Speech Synthesis Manager ---
// Simple singleton to ensure only one thing is spoken at a time.
const speechManager = {
  isPlaying: false,
  speak(text: string, onEnd: () => void) {
    if (this.isPlaying) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      this.isPlaying = false;
      onEnd();
    };
    this.isPlaying = true;
    window.speechSynthesis.speak(utterance);
  },
  stop() {
    window.speechSynthesis.cancel();
    this.isPlaying = false;
  }
};

// --- Sub-components ---

const FileAttachment: React.FC<{ file: { name: string; type: string; } }> = ({ file }) => (
  <div className="mt-2 flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 max-w-xs">
    <PaperclipIcon className="h-4 w-4 text-blue-600 dark:text-blue-300 flex-shrink-0" />
    <span className="text-sm text-blue-700 dark:text-blue-200 truncate" title={file.name}>
      {file.name}
    </span>
  </div>
);


const SimpleMessageBubble: React.FC<{ message: Message, isUser: boolean }> = ({ message, isUser }) => {
  const sanitizedHtml = message.content ? marked.parse(message.content, { async: false }) as string : '';

  let bubbleClasses = 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none';
  if (message.isError) {
    bubbleClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-bl-none';
  } else if (isUser) {
    bubbleClasses = 'bg-blue-500 text-white rounded-br-none';
  }

  return (
    <div className={`max-w-3xl w-fit px-5 py-3 rounded-2xl shadow-sm ${bubbleClasses}`}>
      <div className="prose prose-sm dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
       {message.file && isUser && <FileAttachment file={message.file} />}
    </div>
  );
};


// --- Main ChatMessage Component ---

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const textToSpeak = message.parts
      ?.filter(p => p.type === PartType.EXPLANATION)
      .map(p => (p as any).text)
      .join(' ');

  const handleSpeak = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
    } else if (textToSpeak) {
      speechManager.speak(textToSpeak, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    // Stop speaking if the component unmounts
    return () => {
      speechManager.stop();
    };
  }, []);


  if (message.parts) {
     return (
        <div className="group flex items-start gap-4 my-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <BotIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex flex-col gap-4 w-full min-w-0">
                {message.parts.map((part, index) => {
                    if (!part) return null;

                    if (part.type === PartType.EXPLANATION) {
                        const sanitizedHtml = marked.parse(part.text, { async: false }) as string;
                        return (
                            <div key={index} className="max-w-3xl w-full px-5 py-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none animate-fade-in-up">
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                            </div>
                        );
                    }

                    if (part.type === PartType.VISUAL) {
                         const visualPart = part as VisualPart;
                         const containerClasses = visualPart.isSummary ? 'max-w-5xl' : 'max-w-3xl';
                         return (
                            <div key={index} className={`${containerClasses} w-full rounded-2xl shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none animate-fade-in-up overflow-hidden transition-all duration-500`}>
                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
                                        <CodeBracketIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                                            {visualPart.isSummary ? 'Grand Finale Summary' : 'Visual Explanation'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 overflow-x-auto">
                                        {/* This wrapper ensures that the container respects the intrinsic width of the AI-generated content,
                                            forcing the parent's overflow-x-auto to activate correctly even with complex layouts. */}
                                        <div className="inline-block min-w-full align-top">
                                            <div dangerouslySetInnerHTML={{ __html: part.html }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    
                    return null;
                })}
            </div>
             {textToSpeak && (
                <button
                    onClick={handleSpeak}
                    className={`p-2 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                        isSpeaking
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-500'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label={isSpeaking ? 'Stop speaking' : 'Read text aloud'}
                >
                    <SpeakerIcon className="h-5 w-5" />
                </button>
            )}
        </div>
     );
  }

  return (
    <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.isError ? 'bg-red-100 dark:bg-red-900/50' : 'bg-gray-200 dark:bg-gray-700'}`}>
          {message.isError 
            ? <AlertTriangleIcon className="h-6 w-6 text-red-500" /> 
            : <BotIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
        </div>
      )}
      
      <div className="flex flex-col items-end">
        <SimpleMessageBubble message={message} isUser={isUser} />
      </div>

       {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;