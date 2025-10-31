import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

type PlaybackState = 'stopped' | 'playing' | 'paused';

export const useAudioPlayback = () => {
    const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
    const [isLoading, setIsLoading] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const lastPlayedTextRef = useRef<string>('');
    const startTimeRef = useRef(0);
    const pauseTimeRef = useRef(0);

    // Initialize AudioContext
    useEffect(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext && !audioContextRef.current) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        
        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.onended = null;
                audioSourceRef.current.stop();
            }
            audioContextRef.current?.close().then(() => {
                audioContextRef.current = null;
            });
        };
    }, []);

    const stop = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null; // Prevent onended from firing on manual stop
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setPlaybackState('stopped');
        pauseTimeRef.current = 0;
    }, []);
    
    const playFromBuffer = useCallback((buffer: AudioBuffer, resumeTime: number = 0) => {
        const audioContext = audioContextRef.current;
        if (!audioContext) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        stop(); // Stop any currently playing audio before starting new

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        
        startTimeRef.current = audioContext.currentTime - resumeTime;
        source.start(0, resumeTime);
        
        source.onended = () => {
            // Check if it was a natural end, not a manual stop
            if (audioSourceRef.current === source) {
                setPlaybackState('stopped');
                pauseTimeRef.current = 0;
                audioSourceRef.current = null;
            }
        };
        
        audioSourceRef.current = source;
        setPlaybackState('playing');
    }, [stop]);

    const togglePlayPause = useCallback(async (text: string) => {
        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        // Pause
        if (playbackState === 'playing') {
            if (audioSourceRef.current) {
                pauseTimeRef.current = audioContext.currentTime - startTimeRef.current;
                stop();
                setPlaybackState('paused');
            }
            return;
        }

        // Resume
        if (playbackState === 'paused' && audioBufferRef.current && lastPlayedTextRef.current === text) {
            playFromBuffer(audioBufferRef.current, pauseTimeRef.current);
            return;
        }

        // Play from start (or fetch new audio)
        stop();
        if (audioBufferRef.current && lastPlayedTextRef.current === text) {
            playFromBuffer(audioBufferRef.current);
        } else {
            setIsLoading(true);
            try {
                const audioData = await getSpeechAudio(text);
                if (audioData) {
                    const decodedBytes = decode(audioData);
                    const newBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
                    audioBufferRef.current = newBuffer;
                    lastPlayedTextRef.current = text;
                    playFromBuffer(newBuffer);
                }
            } catch (err) {
                console.error("Failed to generate or decode audio:", err);
            } finally {
                setIsLoading(false);
            }
        }
    }, [playbackState, playFromBuffer, stop]);


    return { togglePlayPause, playbackState, isLoading, stop };
};
