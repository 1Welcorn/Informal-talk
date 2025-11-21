import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dialogueData, formalityScenarios, Dialogue, FormalityScenario, getAudio, saveAudio } from '../constants';
// Fix: Importing Gemini API classes and types according to guidelines.
import { GoogleGenAI, Modality } from '@google/genai';

// --- START: Helper Icons ---
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);
// --- END: Helper Icons ---

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface DialoguePracticeProps {
    onBack: () => void;
    audioCache: Map<string, AudioBuffer>;
    audioContext: AudioContext | null;
    completedDialogues: number[];
    onDialogueComplete: (dialogueId: number) => void;
}

const DialoguePractice: React.FC<DialoguePracticeProps> = ({ onBack, audioCache, audioContext, completedDialogues, onDialogueComplete }) => {
    // Fix: Corrected the TypeScript union type syntax by adding a '|' operator.
    const [practiceType, setPracticeType] = useState<'dialogue' | 'formality' | null>(null);
    const activeAudioSource = useRef<AudioBufferSourceNode | null>(null);

    const stopCurrentAudio = useCallback(() => {
        if (activeAudioSource.current) {
            activeAudioSource.current.onended = null;
            activeAudioSource.current.stop();
            activeAudioSource.current = null;
        }
    }, []);
    
    useEffect(() => {
        return () => {
            stopCurrentAudio();
        };
    }, [stopCurrentAudio]);

    const speakText = async (text: string, onEnded?: () => void) => {
        if (!audioContext) {
            if (onEnded) onEnded();
            return;
        }

        stopCurrentAudio();

        try {
            let buffer = audioCache.get(text);

            if (!buffer) {
                const audioBytes = await getAudio(text);
                if (audioBytes) {
                    buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                    if(buffer) audioCache.set(text, buffer);
                }
            }

            if (!buffer && process.env.REACT_APP_GEMINI_API_KEY) {
                const ai = new GoogleGenAI({apiKey: process.env.REACT_APP_GEMINI_API_KEY});
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                    }
                });
                
                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    const audioBytes = decode(base64Audio);
                    saveAudio(text, audioBytes); // Fire and forget
                    buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                    audioCache.set(text, buffer);
                }
            }
            
            if (buffer) {
                const source = audioContext.createBufferSource();
                activeAudioSource.current = source;
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start();

                source.onended = () => {
                    if (activeAudioSource.current === source) {
                        activeAudioSource.current = null;
                    }
                    if (onEnded) {
                        onEnded();
                    }
                };
            } else {
                 if (onEnded) onEnded();
            }
        } catch (error) {
            console.error(`Failed to generate audio for text: ${text}`, error);
            if (onEnded) onEnded();
        }
    };

    const playAudio = (text: string) => {
        speakText(text);
    };

    const renderSelectionScreen = () => (
        <div className="w-full text-center flex-grow flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-4">Pratique Suas Habilidades</h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-12">Escolha uma atividade para começar.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mx-auto w-full">
                <button 
                    onClick={() => setPracticeType('dialogue')} 
                    className="bg-white border border-border-gray hover:border-primary p-6 md:p-8 rounded-xl shadow-sm text-left transition-all group"
                >
                    <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">Cenários de Prática</h2>
                    <p className="text-base md:text-lg text-slate-600">Complete diálogos escolhendo a frase correta. Isso helps a entender o contexto.</p>
                </button>
                 <button 
                    onClick={() => setPracticeType('formality')} 
                    className="bg-white border border-border-gray hover:border-primary p-6 md:p-8 rounded-xl shadow-sm text-left transition-all group"
                 >
                    <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">Formal vs. Informal</h2>
                    <p className="text-base md:text-lg text-slate-600">Escolha a frase certa para a situação. Aprenda quando usar as contrações.</p>
                </button>
            </div>
        </div>
    );

    const handleBackToSelection = () => {
        stopCurrentAudio();
        setPracticeType(null);
    };

    return (
        <div className="h-full w-full bg-background text-secondary flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 animate-fade-in relative">
            <div className="absolute top-4 left-4 z-10">
                <button onClick={practiceType ? handleBackToSelection : onBack} className={`bg-white hover:bg-light-gray border border-border-gray transition-all duration-300 text-secondary font-bold rounded-lg shadow-sm py-2 px-4 md:py-2 md:px-5 text-base md:text-lg`}>
                    &larr; {practiceType ? 'Menu de Prática' : 'Menu Principal'}
                </button>
            </div>
            
            {!practiceType && renderSelectionScreen()}
            {practiceType === 'dialogue' && <FillInTheBlanksPractice playAudio={playAudio} speakText={speakText} stopCurrentAudio={stopCurrentAudio} completedDialogues={completedDialogues} onDialogueComplete={onDialogueComplete} />}
            {practiceType === 'formality' && <FormalityPractice speakText={speakText} stopCurrentAudio={stopCurrentAudio} />}

        </div>
    );
};

const FillInTheBlanksPractice = ({ playAudio, speakText, stopCurrentAudio, completedDialogues, onDialogueComplete }: { playAudio: (text: string) => void, speakText: (text: string, onEnded?: () => void) => void, stopCurrentAudio: () => void, completedDialogues: number[], onDialogueComplete: (dialogueId: number) => void }) => {
    const [view, setView] = useState<'list' | 'practice'>('list');
    const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);
    const [correctlySelected, setCorrectlySelected] = useState<string[]>([]);
    const [incorrectlySelected, setIncorrectlySelected] = useState<string[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const isComplete = selectedDialogue && Array.isArray(selectedDialogue.correctWord) && correctlySelected.length === selectedDialogue.correctWord.length;

    useEffect(() => {
        if (isComplete && selectedDialogue) {
            onDialogueComplete(selectedDialogue.id);
        }
    }, [isComplete, selectedDialogue, onDialogueComplete]);

    const handleDialogueSelect = (dialogue: Dialogue) => {
        setSelectedDialogue(dialogue);
        setCorrectlySelected([]);
        setIncorrectlySelected([]);
        setView('practice');
        
        // Pre-load audio for all possible correct answer combinations
        if (Array.isArray(dialogue.correctWord) && dialogue.correctWord.length > 0) {
            // Pre-load audio for each individual correct word
            dialogue.correctWord.forEach((word, index) => {
                const wordsUpToThis = dialogue.correctWord.slice(0, index + 1).sort();
                const sentenceToPreload = `${dialogue.promptPrefix} ${wordsUpToThis.join(' and ')}.`;
                
                // Pre-generate audio in background (don't await, fire and forget)
                setTimeout(() => {
                    speakText(sentenceToPreload, () => {}); // Empty callback to prevent UI state changes
                }, index * 100); // Stagger requests slightly to avoid overwhelming API
            });
        }
    };

    const handleBackToList = () => {
        stopCurrentAudio();
        setView('list');
        setSelectedDialogue(null);
    };

    const handleWordClick = (word: string) => {
        if (!selectedDialogue || isComplete || isSpeaking || correctlySelected.includes(word) || incorrectlySelected.includes(word)) return;

        const isCorrect = Array.isArray(selectedDialogue.correctWord) && selectedDialogue.correctWord.includes(word);

        if (isCorrect) {
            // Immediately show loading state for instant feedback
            setIsSpeaking(true);
            
            const newCorrectWords = [...correctlySelected, word].sort();
            setCorrectlySelected(newCorrectWords);

            const sentenceToSpeak = `${selectedDialogue.promptPrefix} ${newCorrectWords.join(' and ')}.`;
            speakText(sentenceToSpeak, () => setIsSpeaking(false));
        } else {
            setIncorrectlySelected(prev => [...prev, word]);
            playAudio('Try again.');
        }
    };

    if (view === 'list') {
        return (
             <div className="w-full text-center animate-fade-in mx-auto flex-grow flex flex-col justify-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-8">Cenários de Prática</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dialogueData.filter(d => d.blankType !== 'custom').map(dialogue => {
                        const isDialogueCompleted = completedDialogues.includes(dialogue.id);
                        return (
                        <button 
                            key={dialogue.id}
                            onClick={() => handleDialogueSelect(dialogue)}
                            className="p-6 bg-white hover:border-primary border border-border-gray rounded-xl shadow-sm transition-all text-left h-full relative"
                        >
                            {isDialogueCompleted && <span className="absolute top-4 right-4"><CheckIcon className="h-6 w-6 text-green-500" /></span>}
                            <h3 className="text-xl md:text-2xl font-bold text-primary">{dialogue.title}</h3>
                            <p className="text-base md:text-lg text-slate-600 mt-2">{dialogue.locationSentence}</p>
                        </button>
                    )})}
                </div>
            </div>
        );
    }

    if (view === 'practice' && selectedDialogue) {
        const displayedWords = correctlySelected.join(' and ');
        return (
             <div className="bg-white text-secondary border border-border-gray rounded-2xl shadow-lg p-6 md:p-12 w-full animate-fade-in flex-grow flex flex-col justify-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">{selectedDialogue.title}</h2>
                <p className="text-xl md:text-2xl text-slate-600 text-center mb-4">{selectedDialogue.locationSentence}</p>
                {correctlySelected.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800 text-center">
                        💡 Tip: Audio may take a moment to load the first time, then it's instant!
                    </div>
                )}
                <div className="bg-light-gray p-4 md:p-6 rounded-lg text-2xl md:text-4xl text-center font-semibold mb-8 min-h-[60px] md:min-h-[100px] flex flex-col items-center justify-center">
                    <p>{selectedDialogue.promptPrefix} <span className={`text-primary font-bold ${isSpeaking ? 'animate-subtle-pulse' : ''}`}>{displayedWords || '...'}</span></p>
                    {isSpeaking && (
                        <div className="mt-3 flex items-center gap-2 text-sm md:text-base text-indigo-600 animate-fade-in">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading audio...</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {selectedDialogue.words?.map(word => {
                        const isCorrectlyPicked = correctlySelected.includes(word);
                        const isIncorrectlyPicked = incorrectlySelected.includes(word);
                        return (
                            <button 
                                key={word} 
                                onClick={() => handleWordClick(word)}
                                disabled={isComplete || isIncorrectlyPicked || isCorrectlyPicked || isSpeaking}
                                className={`p-4 md:p-6 rounded-lg text-lg md:text-2xl font-medium transition-all duration-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-70 text-center h-full border
                                    ${isCorrectlyPicked ? 'bg-green-500 text-white border-green-600' : ''}
                                    ${isIncorrectlyPicked ? 'bg-red-500 text-white border-red-600 line-through' : ''}
                                    ${!isCorrectlyPicked && !isIncorrectlyPicked ? 'bg-white hover:bg-light-gray border-border-gray' : 'bg-gray-50 border-border-gray'}
                                `}
                            >
                                {word}
                            </button>
                        );
                    })}
                </div>
                {isComplete && (
                    <div className="mt-8 text-center animate-fade-in">
                        <p className="text-3xl md:text-4xl font-bold text-green-600">Excelente trabalho!</p>
                        <button onClick={handleBackToList} className="mt-4 bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all text-lg md:text-xl">
                            Escolher Outro Cenário
                        </button>
                    </div>
                )}
                <div className="text-center mt-8">
                    <button onClick={handleBackToList} className="text-primary hover:underline font-semibold text-base md:text-lg">&larr; Voltar para a Lista de Cenários</button>
                </div>
            </div>
        );
    }

    return null;
};


const FormalityPractice = ({ speakText, stopCurrentAudio }: { speakText: (text: string, onEnded?: () => void) => void, stopCurrentAudio: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<'formal' | 'informal' | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const currentScenario = formalityScenarios[currentIndex];

    const handleSelectOption = (option: 'formal' | 'informal') => {
        if (showFeedback) return;
        setSelectedOption(option);
        setShowFeedback(true);
        speakText(currentScenario.feedback);
    };

    const handleNext = () => {
        stopCurrentAudio();
        setShowFeedback(false);
        setSelectedOption(null);
        setCurrentIndex((prev) => (prev + 1) % formalityScenarios.length);
    };
    
    const getButtonClass = (option: 'formal' | 'informal') => {
        if (!showFeedback) {
            return 'bg-white hover:bg-light-gray border-border-gray';
        }
        if (option === currentScenario.correct) {
            return 'bg-green-500 text-white border-green-600 ring-4 ring-green-200';
        }
        if (option === selectedOption) {
            return 'bg-red-500 text-white border-red-600 ring-4 ring-red-200';
        }
        return 'bg-white opacity-60 border-border-gray';
    };

    return (
         <div className="bg-white border border-border-gray text-secondary rounded-2xl shadow-lg p-6 md:p-12 w-full text-center animate-fade-in flex-grow flex flex-col justify-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Formal vs. Informal</h2>
            <p className="text-base md:text-lg text-slate-600 mb-6">Escolha a melhor opção para a situação.</p>
            
            <div className="bg-light-gray p-4 rounded-lg mb-8 text-left">
                <p className="text-base md:text-lg font-semibold text-primary">Situação:</p>
                <p className="text-base md:text-lg">{currentScenario.context}</p>
            </div>

            <div className="bg-slate-200 p-6 rounded-lg text-xl md:text-3xl font-semibold mb-8">
                {currentScenario.sentence[0]}
                <span className="inline-block bg-slate-300 rounded-md text-slate-300 w-24 md:w-40 mx-2 select-none">...</span>
                {currentScenario.sentence[1]}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                <button onClick={() => handleSelectOption('formal')} disabled={showFeedback} className={`p-4 md:p-6 rounded-lg text-lg md:text-2xl font-bold transition-all duration-300 shadow-sm border ${getButtonClass('formal')}`}>
                    {currentScenario.options.formal}
                </button>
                 <button onClick={() => handleSelectOption('informal')} disabled={showFeedback} className={`p-4 md:p-6 rounded-lg text-lg md:text-2xl font-bold transition-all duration-300 shadow-sm border ${getButtonClass('informal')}`}>
                    {currentScenario.options.informal}
                </button>
            </div>

            {showFeedback && (
                <div className="p-4 rounded-lg bg-indigo-50 text-indigo-800 text-base md:text-lg animate-fade-in border border-indigo-200">
                    <p>{currentScenario.feedback}</p>
                    <button onClick={handleNext} className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all text-base">
                        Próximo &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default DialoguePractice;