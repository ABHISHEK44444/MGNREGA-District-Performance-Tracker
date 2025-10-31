import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Loader } from './Loader';
import { ShieldCheckIcon, PaperAirplaneIcon, MicrophoneIcon } from './Icons';
import { getRightsInformationStream } from '../services/geminiService';

interface KnowYourRightsAssistantProps {
    language: 'en' | 'hi';
    onClose: () => void;
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const PromptStarter: React.FC<{ text: string; onClick: (prompt: string) => void }> = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full hover:bg-indigo-200 transition-colors text-left"
  >
    {text}
  </button>
);

export const KnowYourRightsAssistant: React.FC<KnowYourRightsAssistantProps> = ({ language, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
  
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any | null>(null);

    const uiStrings = {
        en: {
            title: "Know Your Rights",
            description: "Ask me anything about your rights under the MGNREGA scheme.",
            placeholder: "e.g., How do I get a job card?",
            initialGreeting: "Hello! I'm Sahayika, your guide to MGNREGA rights.",
            initialPrompt: "You can ask questions or use the examples below to start.",
            thinking: "Thinking...",
            prompts: [
                "How do I apply for a job card?",
                "When should I get paid for my work?",
                "What is unemployment allowance?",
            ],
            sendMessage: "Send message",
            listen: "Start listening",
            stopListen: "Stop listening"
        },
        hi: {
            title: "अपने अधिकार जानें",
            description: "मनरेगा योजना के तहत अपने अधिकारों के बारे में मुझसे कुछ भी पूछें।",
            placeholder: "जैसे, मुझे जॉब कार्ड कैसे मिलेगा?",
            initialGreeting: "नमस्ते! मैं सहायिका हूँ, मनरेगा अधिकारों के लिए आपकी गाइड।",
            initialPrompt: "आप सवाल पूछ सकते हैं या शुरू करने के लिए नीचे दिए गए उदाहरणों का उपयोग कर सकते हैं।",
            thinking: "सोच रही हूँ...",
            prompts: [
                "मैं जॉब कार्ड के लिए आवेदन कैसे करूं?",
                "मुझे मेरे काम का भुगतान कब मिलना चाहिए?",
                "बेरोजगारी भत्ता क्या है?",
            ],
            sendMessage: "संदेश भेजें",
            listen: "सुनना शुरू करें",
            stopListen: "सुनना बंद करें"
        }
    };

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'en' ? 'en-US' : 'hi-IN';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) setUserInput(prev => prev + finalTranscript);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        
        return () => { recognition.stop(); }
    }, [language]);

    useEffect(() => {
        chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (question: string) => {
        if (!question.trim() || isLoading) return;
        if (isListening) recognitionRef.current?.stop();

        const userMessage: Message = { id: Date.now(), sender: 'user', text: question };
        const aiMessagePlaceholder: Message = { id: Date.now() + 1, sender: 'ai', text: '' };
        
        setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
        setUserInput('');
        setIsLoading(true);

        try {
            const stream = getRightsInformationStream(question, language);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.text += chunk;
                    return newMessages;
                });
            }
        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                lastMessage.text = 'Sorry, I encountered an error. Please try again.';
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

    const currentStrings = uiStrings[language];

    return (
        <Modal onClose={onClose}>
            <div className="p-6 flex flex-col h-full">
                <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-indigo-500 text-white rounded-lg p-3">
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-indigo-600">{currentStrings.title}</h2>
                            <p className="text-sm text-gray-500">{currentStrings.description}</p>
                        </div>
                    </div>
                </div>

                <div ref={chatHistoryRef} className="flex-grow bg-gray-50 rounded-lg p-4 overflow-y-auto border space-y-4 min-h-[300px]">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <p className="font-semibold">{currentStrings.initialGreeting}</p>
                            <p className="text-sm">{currentStrings.initialPrompt}</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-2xl whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-brand-blue text-white rounded-br-none' : 'bg-gray-200 text-brand-dark-gray rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.sender === 'ai' && !messages[messages.length - 1]?.text && (
                        <div className="flex justify-start">
                            <div className="max-w-md p-3 rounded-2xl bg-gray-200 text-brand-dark-gray rounded-bl-none flex items-center">
                                <Loader /> <span className="ml-2 text-sm">{currentStrings.thinking}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 mt-4 space-y-3">
                    <div className="flex flex-wrap justify-center gap-2">
                        {currentStrings.prompts.map(prompt => <PromptStarter key={prompt} text={prompt} onClick={handleSendMessage} />)}
                    </div>
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={currentStrings.placeholder}
                            className="flex-grow bg-white border border-gray-300 text-brand-dark-gray text-base rounded-full focus:ring-brand-blue focus:border-brand-blue p-3 px-5"
                            disabled={isLoading}
                        />
                         {recognitionRef.current && (
                            <button type="button" onClick={handleToggleListening} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-brand-dark-gray hover:bg-gray-300'}`} aria-label={isListening ? currentStrings.stopListen : currentStrings.listen}>
                                <MicrophoneIcon className="h-6 w-6" />
                            </button>
                        )}
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-brand-green text-white rounded-full p-3 shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100" aria-label={currentStrings.sendMessage}>
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};
