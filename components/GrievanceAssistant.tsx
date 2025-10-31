import React, { useState, useRef, useEffect } from 'react';
import type { PerformanceData } from '../types';
import { Modal } from './Modal';
import { Loader } from './Loader';
import { GavelIcon, MicrophoneIcon, PaperAirplaneIcon, CopyIcon, PrinterIcon } from './Icons';
import { generateGrievanceLetter } from '../services/geminiService';

interface GrievanceAssistantProps {
    performanceData: PerformanceData;
    language: 'en' | 'hi';
    onClose: () => void;
}

export const GrievanceAssistant: React.FC<GrievanceAssistantProps> = ({ performanceData, language, onClose }) => {
    const [name, setName] = useState('');
    const [village, setVillage] = useState('');
    const [complaintType, setComplaintType] = useState('');
    const [details, setDetails] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const recognitionRef = useRef<any | null>(null);

    const uiStrings = {
        en: {
            title: "Grievance Letter Assistant",
            description: "Describe your problem, and the AI will help you draft a formal complaint letter.",
            nameLabel: "Your Full Name",
            villageLabel: "Your Village / Block",
            complaintTypeLabel: "Type of Complaint",
            complaintTypes: ['Unpaid Wages', 'Job Card Issue', 'Demand for Work', 'Quality of Work', 'Other'],
            detailsLabel: "Describe your problem in detail",
            generateButton: "Generate Letter",
            generatingButton: "Generating...",
            disclaimer: "This is an AI-generated draft. Please review it carefully before submitting.",
            copyButton: "Copy Text",
            copied: "Copied!",
            printButton: "Print Letter",
            listen: "Start listening",
            stopListen: "Stop listening"
        },
        hi: {
            title: "शिकायत पत्र सहायक",
            description: "अपनी समस्या का वर्णन करें, और एआई आपको एक औपचारिक शिकायत पत्र का मसौदा तैयार करने में मदद करेगा।",
            nameLabel: "आपका पूरा नाम",
            villageLabel: "आपका गाँव / ब्लॉक",
            complaintTypeLabel: "शिकायत का प्रकार",
            complaintTypes: ['मजदूरी का भुगतान नहीं', 'जॉब कार्ड की समस्या', 'काम की मांग', 'काम की गुणवत्ता', 'अन्य'],
            detailsLabel: "अपनी समस्या का विस्तार से वर्णन करें",
            generateButton: "पत्र उत्पन्न करें",
            generatingButton: "उत्पन्न हो रहा है...",
            disclaimer: "यह एआई-जनरेटेड ड्राफ्ट है। कृपया जमा करने से पहले इसकी सावधानीपूर्वक समीक्षा करें।",
            copyButton: "टेक्स्ट कॉपी करें",
            copied: "कॉपी किया गया!",
            printButton: "पत्र प्रिंट करें",
            listen: "सुनना शुरू करें",
            stopListen: "सुनना बंद करें"
        }
    };
    
    // Speech Recognition Setup
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
            if (finalTranscript) {
                setDetails(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
            }
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        
        return () => { recognition.stop(); }
    }, [language]);

    const handleToggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const handleGenerate = async () => {
        if (!name || !village || !complaintType || !details) {
            alert(language === 'en' ? 'Please fill all fields.' : 'कृपया सभी फ़ील्ड भरें।');
            return;
        }
        setIsLoading(true);
        setGeneratedLetter('');
        const result = await generateGrievanceLetter({
            name, village, complaintType, details, district: performanceData.district.name
        }, language);
        setGeneratedLetter(result);
        setIsLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter).then(() => {
            setCopySuccess(uiStrings[language].copied);
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handlePrint = () => {
        const printable = window.open('', '_blank');
        if (printable) {
            printable.document.write('<pre style="white-space: pre-wrap; font-family: sans-serif; font-size: 14px;">' + generatedLetter + '</pre>');
            printable.document.close();
            printable.focus();
            printable.print();
            printable.close();
        }
    };

    const isFormValid = name && village && complaintType && details;
    const currentStrings = uiStrings[language];
    
    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-orange-500 text-white rounded-lg p-3">
                            <GavelIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-orange-600">{currentStrings.title}</h2>
                            <p className="text-sm text-gray-500">{currentStrings.description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{currentStrings.nameLabel}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{currentStrings.villageLabel}</label>
                            <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{currentStrings.complaintTypeLabel}</label>
                        <select value={complaintType} onChange={e => setComplaintType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-2">
                            <option value="">-- Select --</option>
                            {currentStrings.complaintTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{currentStrings.detailsLabel}</label>
                        <div className="relative">
                            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-2 pr-12"></textarea>
                            {recognitionRef.current && (
                                <button
                                    type="button"
                                    onClick={handleToggleListening}
                                    title={isListening ? currentStrings.stopListen : currentStrings.listen}
                                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-brand-dark-gray hover:bg-gray-300'}`}
                                >
                                    <MicrophoneIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <button
                            onClick={handleGenerate}
                            disabled={!isFormValid || isLoading}
                            className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><Loader /> <span className="ml-2">{currentStrings.generatingButton}</span></>
                            ) : (
                                <><PaperAirplaneIcon className="h-6 w-6 mr-2" /> {currentStrings.generateButton}</>
                            )}
                        </button>
                    </div>
                </div>

                {generatedLetter && (
                    <div className="mt-6 border-t pt-4 animate-fade-in">
                        <h3 className="font-semibold text-lg mb-2">{language === 'en' ? 'Generated Letter' : 'उत्पन्न पत्र'}</h3>
                        <div className="relative bg-gray-50 p-4 rounded-md border">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{generatedLetter}</pre>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{currentStrings.disclaimer}</p>
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors w-full sm:w-auto">
                                <CopyIcon className="h-5 w-5" /> {copySuccess || currentStrings.copyButton}
                            </button>
                            <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors w-full sm:w-auto">
                                <PrinterIcon className="h-5 w-5" /> {currentStrings.printButton}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
