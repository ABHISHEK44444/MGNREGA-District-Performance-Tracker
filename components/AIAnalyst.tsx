import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PerformanceData } from '../types';
import { getAIAnalysisStream, getSpeechAudio } from '../services/geminiService';
import { Loader } from './Loader';
import { ChatBubbleIcon, PaperAirplaneIcon, MicrophoneIcon, SpeakerIcon, PlayIcon, PauseIcon } from './Icons';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

interface AIAnalystProps {
  performanceData: PerformanceData;
  language: 'en' | 'hi';
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const PromptStarter: React.FC<{ text: string; onClick: (prompt: string) => void }> = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="px-3 py-1.5 bg-blue-100 text-brand-blue text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
  >
    {text}
  </button>
);

const AIMessageBubble: React.FC<{ text: string, isStreaming: boolean }> = ({ text, isStreaming }) => {
    const { togglePlayPause, playbackState, isLoading: isAudioLoading, stop } = useAudioPlayback();

    const handleToggleSpeech = useCallback(() => {
        if (!isStreaming && text) {
            togglePlayPause(text);
        }
    }, [isStreaming, text, togglePlayPause]);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    const renderSpeakerIcon = () => {
        if (playbackState === 'playing') return <PauseIcon className="h-5 w-5 text-gray-700" />;
        if (playbackState === 'paused') return <PlayIcon className="h-5 w-5 text-gray-700" />;
        return <SpeakerIcon className="h-5 w-5 text-gray-700" />;
    };

    return (
        <div className="flex justify-start">
            <div className="relative group max-w-md p-3 rounded-2xl bg-gray-200 text-brand-dark-gray rounded-bl-none">
                <div className="whitespace-pre-wrap pr-8 font-sans leading-relaxed">
                    {(text || "").split('\n').map((line, lineIndex) => {
                        const isListItem = line.trim().startsWith('*') || line.trim().startsWith('-');
                        const content = line.replace(/^[*-]\s*/, '');
                        return (
                            <div key={lineIndex} className={`flex items-start mb-2 ${isListItem ? 'ml-4' : ''}`}>
                                {isListItem && <span className="mr-2 mt-1">•</span>}
                                <p>
                                    {content.split(/(\*\*.*?\*\*)/g).map((part, partIndex) =>
                                        part.startsWith('**') && part.endsWith('**') ?
                                        <strong key={partIndex}>{part.slice(2, -2)}</strong> :
                                        part
                                    )}
                                </p>
                            </div>
                        );
                    })}
                </div>
                <button 
                    onClick={handleToggleSpeech} 
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Play audio response"
                    disabled={isStreaming || isAudioLoading}
                >
                    {renderSpeakerIcon()}
                </button>
            </div>
        </div>
    );
};


export const AIAnalyst: React.FC<AIAnalystProps> = ({ performanceData, language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null); // For SpeechRecognition

  const uiStrings = {
    en: {
        title: "AI Analyst",
        placeholder: `Ask about ${performanceData.district.name}...`,
        initialGreeting: `Ask me anything about ${performanceData.district.name}'s data!`,
        initialPrompt: "You can use the prompts below to get started.",
        analyzing: "Analyzing...",
        prompts: [
            `Summarize the performance trends for ${performanceData.district.name}.`,
            "What are the main strengths and weaknesses based on this data?",
            "Compare the latest year's data with the state average in detail.",
        ],
        sendMessage: "Send message",
        listen: "Start listening",
        stopListen: "Stop listening"
    },
    hi: {
        title: "एआई विश्लेषक",
        placeholder: `${performanceData.district.name} के बारे में पूछें...`,
        initialGreeting: `${performanceData.district.name} के डेटा के बारे में मुझसे कुछ भी पूछें!`,
        initialPrompt: "शुरू करने के लिए आप नीचे दिए गए संकेतों का उपयोग कर सकते हैं।",
        analyzing: "विश्लेषण हो रहा है...",
        prompts: [
            `${performanceData.district.name} के प्रदर्शन की प्रवृत्तियों का सारांश दें।`,
            "इस डेटा के आधार पर मुख्य ताकत और कमजोरियां क्या हैं?",
            "नवीनतम वर्ष के डेटा की राज्य के औसत से विस्तार से तुलना करें।",
        ],
        sendMessage: "संदेश भेजें",
        listen: "सुनना शुरू करें",
        stopListen: "सुनना बंद करें"
    }
  }

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'en' ? 'en-US' : 'hi-IN';

    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setUserInput(finalTranscript + interimTranscript);
    };
    recognition.onend = () => { setIsListening(false); };
    recognitionRef.current = recognition;
    
    return () => {
        recognition.stop();
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
    }

  }, [language]);


  // Clear chat when district changes
  useEffect(() => {
    setMessages([]);
  }, [performanceData.district.name]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;
    if (isListening) recognitionRef.current?.stop();

    const userMessage: Message = { id: Date.now(), sender: 'user', text: question };
    const aiMessagePlaceholder: Message = { id: Date.now() + 1, sender: 'ai', text: '' };
    
    setMessages(prevMessages => [...prevMessages, userMessage, aiMessagePlaceholder]);
    setUserInput('');
    setIsLoading(true);

    try {
      const stream = getAIAnalysisStream(performanceData, question, language);
      for await (const chunk of stream) {
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessageIndex = newMessages.length - 1;
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            text: newMessages[lastMessageIndex].text + chunk,
          };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessageIndex = newMessages.length - 1;
        newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            text: 'Sorry, I encountered an error. Please try again.',
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };
  
  return (
    <div className="mt-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <ChatBubbleIcon className="h-8 w-8 text-brand-blue" />
                <h3 className="text-xl font-semibold text-brand-dark-gray">{uiStrings[language].title}</h3>
            </div>
        </div>
        
        <div ref={chatHistoryRef} className="h-80 bg-gray-50 rounded-lg p-4 overflow-y-auto border space-y-4">
          {messages.length === 0 && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <p className="font-semibold">{uiStrings[language].initialGreeting}</p>
                <p className="text-sm">{uiStrings[language].initialPrompt}</p>
            </div>
          )}
          {messages.map((msg, index) => (
             msg.sender === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-md p-3 rounded-2xl bg-brand-blue text-white rounded-br-none whitespace-pre-wrap">{msg.text}</div>
                </div>
              ) : (
                <AIMessageBubble 
                    key={msg.id} 
                    text={msg.text} 
                    isStreaming={isLoading && index === messages.length - 1}
                />
              )
          ))}
           {isLoading && messages[messages.length-1]?.sender === 'ai' && !messages[messages.length-1]?.text && (
            <div className="flex justify-start">
               <div className="max-w-md p-3 rounded-2xl bg-gray-200 text-brand-dark-gray rounded-bl-none flex items-center">
                   <Loader />
                   <span className="ml-2 text-sm">{uiStrings[language].analyzing}</span>
               </div>
            </div>
           )}
        </div>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2">
            {uiStrings[language].prompts.map(prompt => (
                <PromptStarter key={prompt} text={prompt} onClick={handleSendMessage} />
            ))}
        </div>

        <form onSubmit={handleFormSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={uiStrings[language].placeholder}
            className="flex-grow bg-gray-50 border border-gray-300 text-brand-dark-gray text-base rounded-full focus:ring-brand-blue focus:border-brand-blue p-3 px-5"
            aria-label="Ask a question about the data"
            disabled={isLoading}
          />
          {recognitionRef.current && (
            <button
                type="button"
                onClick={handleToggleListening}
                className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-brand-dark-gray hover:bg-gray-300'}`}
                aria-label={isListening ? uiStrings[language].stopListen : uiStrings[language].listen}
            >
                <MicrophoneIcon className="h-6 w-6" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-brand-green text-white rounded-full p-3 shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            aria-label={uiStrings[language].sendMessage}
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
