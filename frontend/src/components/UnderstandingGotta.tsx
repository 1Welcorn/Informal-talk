import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { getAudio, saveAudio } from '../constants';

// --- START: Helper Icons ---
const VolumeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
);
// --- END: Helper Icons ---

// Helper functions for audio decoding
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


interface UnderstandingGottaProps {
    onBack: () => void;
    onNavigate: (sectionId: string) => void;
    audioContext: AudioContext | null;
    audioCache: Map<string, AudioBuffer>;
}

const examples = [
    { type: 'Gotta', formal: 'I have to go now.', informal: 'I gotta go now.', translation: 'Eu tenho que ir agora.' },
    { type: 'Gotta', formal: 'She has to leave early.', informal: 'She gotta leave early.', translation: 'Ela tem que sair mais cedo.' },
    { type: 'Gonna', formal: 'I am going to call him later.', informal: 'I\'m gonna call him later.', translation: 'Eu vou ligar para ele mais tarde.' },
    { type: 'Gonna', formal: 'It is going to rain.', informal: 'It\'s gonna rain.', translation: 'Vai chover.' },
    { type: 'Wanna', formal: 'I want to watch a movie.', informal: 'I wanna watch a movie.', translation: 'Eu quero assistir a um filme.' },
    { type: 'Wanna', formal: 'Do you want to get some coffee?', informal: 'Do you wanna get some coffee?', translation: 'Você quer pegar um café?' },
];

const glossaryItems = [
    { contraction: 'Gimme', full: 'Give me', meaning: 'Me dá / Me dê' },
    { contraction: 'Lemme', full: 'Let me', meaning: 'Deixa eu / Me deixe' },
    { contraction: 'Kinda', full: 'Kind of', meaning: 'Meio que / Tipo' },
    { contraction: 'Outta', full: 'Out of', meaning: 'Fora de' },
    { contraction: 'Ain\'t', full: 'is not / are not / etc.', meaning: 'Não é / não são / não tenho' },
];


interface InfoCardProps {
    title: string;
    children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
    <div className="bg-white border border-border-gray p-6 rounded-xl shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">{title}</h3>
        <div className="text-base md:text-lg text-slate-700 space-y-3">
            {children}
        </div>
    </div>
);

const contractionDetails = {
    'Gotta': {
        title: "Gotta = 'Have got to'",
        description: [
            "'Gotta' é uma contração informal de 'have got to'. Significa o mesmo que 'have to' (ter que) ou 'must' (dever).",
            "É usado para expressar uma necessidade ou obrigação de fazer algo."
        ],
        syntax: "[Subject] + gotta + [Base Verb]",
        note: null,
    },
    'Gonna': {
        title: "Gonna = 'Going to'",
        description: [
            "'Gonna' é a forma curta de 'going to'. É usado para falar sobre planos e intenções futuras.",
        ],
        syntax: "[Subject] + am/is/are + gonna + [Base Verb]",
        note: "Muitas vezes, o verbo 'to be' (am/is/are) é contraído com o sujeito (ex: I'm gonna, He's gonna).",
    },
    'Wanna': {
        title: "Wanna = 'Want to'",
        description: [
            "'Wanna' é a contração de 'want to'. É usado para expressar um desejo ou vontade.",
        ],
        syntax: "[Subject] + wanna + [Base Verb]",
        note: "'Wanna' não é usado com he/she/it. Nesses casos, usa-se 'wants to' (ex: 'She wants to go').",
    }
}

type Contraction = 'Gotta' | 'Gonna' | 'Wanna';

const UnderstandingGotta: React.FC<UnderstandingGottaProps> = ({ onBack, onNavigate, audioContext, audioCache }) => {
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Contraction>('Gotta');
    
    const speakText = async (text: string) => {
        if (!audioContext || !process.env.REACT_APP_GEMINI_API_KEY || speakingText) return;
        
        setSpeakingText(text);
        const onFinish = () => setSpeakingText(null);

        try {
            let buffer = audioCache.get(text);

            if (!buffer) {
                const audioBytes = await getAudio(text);
                if (audioBytes) {
                    buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                    if(buffer) audioCache.set(text, buffer);
                }
            }

            if (!buffer) {
                const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
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
                    if(buffer) audioCache.set(text, buffer);
                }
            }
            
            if (buffer) {
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start();
                source.onended = onFinish;
            } else {
                onFinish();
            }
        } catch (error) {
            console.error(`Failed to generate audio for text: ${text}`, error);
            onFinish();
        }
    };

    const currentDetails = contractionDetails[activeTab];

    return (
        <div className="h-full w-full bg-background text-secondary flex flex-col p-4 md:p-8 lg:p-12 animate-fade-in relative overflow-y-auto">
            <div className="absolute top-4 left-4 z-10">
                 <button onClick={onBack} className={`bg-white hover:bg-light-gray border border-border-gray transition-all duration-300 text-secondary font-bold rounded-lg shadow-sm py-2 px-4 md:py-2 md:px-5 text-base md:text-lg`}>
                    &larr; Main Menu
                </button>
            </div>
            
            <div className="w-full mx-auto mt-16 md:mt-12">
                <header className="text-center mb-10 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-secondary">1. Understanding the Common Contractions</h1>
                    <p className="text-lg md:text-xl mt-3 text-slate-600">What they mean and how to use 'gotta', 'gonna', and 'wanna'.</p>
                </header>

                <main className="space-y-8">
                    <div className="bg-white border border-border-gray rounded-xl shadow-sm">
                        <div className="flex border-b border-border-gray p-2">
                            {(Object.keys(contractionDetails) as Contraction[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full text-center font-semibold text-lg md:text-xl py-3 rounded-md transition-all duration-300
                                        ${activeTab === tab ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-light-gray hover:text-slate-700'}`
                                    }
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 md:p-8 animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Explanation */}
                                <div className="space-y-4">
                                    <h3 className="text-2xl md:text-3xl font-bold text-primary">{currentDetails.title}</h3>
                                    {currentDetails.description.map((p, i) => (
                                        <p key={i} className="text-base md:text-lg text-slate-700" dangerouslySetInnerHTML={{ __html: p.replace(/'([^']*)'/g, '<strong class="text-primary font-semibold">"$1"</strong>') }}></p>
                                    ))}
                                    <div className="bg-light-gray p-4 rounded-lg my-2 border border-border-gray">
                                        <code className="text-lg md:text-xl text-secondary">{currentDetails.syntax}</code>
                                    </div>
                                    {currentDetails.note && (
                                         <p className={`text-sm p-3 rounded-lg ${activeTab === 'Wanna' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-light-gray border border-border-gray'}`} dangerouslySetInnerHTML={{ __html: currentDetails.note.replace(/'([^']*)'/g, '<strong class="font-semibold">"$1"</strong>') }}></p>
                                    )}
                                </div>
                                {/* Right Column: Examples */}
                                <div>
                                     <h4 className="text-lg md:text-xl font-bold text-slate-500 border-b-2 border-border-gray pb-2 mb-4">Examples:</h4>
                                     <div className="space-y-3">
                                        {examples.filter(ex => ex.type === activeTab).map((ex, index) => (
                                            <div key={`${activeTab}-${index}`} className="bg-light-gray p-4 rounded-lg border border-border-gray">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className={`text-base md:text-lg font-semibold text-secondary ${speakingText === ex.informal ? 'animate-subtle-pulse' : ''}`}>{ex.informal}</p>
                                                        <p className="text-sm md:text-base text-slate-500 italic">Formal: "{ex.formal}"</p>
                                                    </div>
                                                    <button onClick={() => speakText(ex.informal)} disabled={!!speakingText} className="ml-4 p-2 rounded-full bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-wait" aria-label={`Listen to the phrase: ${ex.informal}`}><VolumeIcon className={`h-5 w-5 text-white ${speakingText === ex.informal ? 'animate-pulse' : ''}`} /></button>
                                                </div>
                                                <p className="mt-2 text-base md:text-lg text-primary/80 font-medium">🇧🇷 {ex.translation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-6">
                        <p className="text-lg md:text-xl text-slate-700">Agora que você entendeu, que tal um pouco de prática?</p>
                        <button onClick={() => onNavigate('section-2')} className="mt-4 bg-accent text-white hover:bg-accent/90 font-bold rounded-lg shadow-md py-3 px-8 text-lg md:text-xl transition-all">
                            Ir para a Prática &rarr;
                        </button>
                    </div>

                    <InfoCard title="Guia de Pronúncia (Para Brasileiros)">
                        <p>A pronúncia dessas palavras pode ser complicada. Aqui vai uma dica para ajudar:</p>
                        <ul className="list-disc list-inside space-y-2 mt-3">
                            <li>
                                <strong className="text-primary font-semibold">Gotta:</strong> O som de "tt" parece com o "r" fraco do português, como na palavra "ca<strong className="font-semibold">r</strong>o". Pense em <strong className="font-semibold">"góra"</strong>.
                            </li>
                            <li>
                                <strong className="text-primary font-semibold">Gonna:</strong> A pronúncia é bem direta. Pense em <strong className="font-semibold">"góna"</strong>.
                            </li>
                            <li>
                                <strong className="text-primary font-semibold">Wanna:</strong> O som é como se fosse "uóna". Pense em <strong className="font-semibold">"uóna"</strong>.
                            </li>
                        </ul>
                    </InfoCard>

                    <InfoCard title="Dicas para Brasileiros">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-lg">Lembre-se do verbo 'to be' com 'gonna'</h4>
                                <p>Em português, dizemos "Eu vou viajar". Em inglês, com 'gonna', é preciso usar o verbo 'to be' ('am', 'is', 'are').</p>
                                <p className="mt-2"><span className="font-semibold text-red-600">❌ Incorreto:</span> <code className="bg-red-100 text-red-800 p-1 rounded-sm">I gonna study.</code></p>
                                <p className="mt-1"><span className="font-semibold text-green-600">✅ Correto:</span> <code className="bg-green-100 text-green-800 p-1 rounded-sm">I<strong className="font-bold">'m</strong> gonna study.</code></p>
                            </div>
                            <div className="border-t border-border-gray pt-4">
                                <h4 className="font-semibold text-lg">Usar 'wanna' com 'he', 'she', ou 'it'</h4>
                                <p>'Wanna' é a contração de 'want to'. Para a terceira pessoa (he/she/it), usamos 'wants to', que não tem uma contração comum.</p>
                                <p className="mt-2"><span className="font-semibold text-red-600">❌ Incorreto:</span> <code className="bg-red-100 text-red-800 p-1 rounded-sm">She wanna go.</code></p>
                                <p className="mt-1"><span className="font-semibold text-green-600">✅ Correto:</span> <code className="bg-green-100 text-green-800 p-1 rounded-sm">She <strong className="font-bold">wants to</strong> go.</code></p>
                            </div>
                        </div>
                    </InfoCard>
                    
                    <InfoCard title="Quando Usar (e Não Usar)">
                        <p><strong className="font-semibold text-green-600">Use 'gotta', 'gonna' e 'wanna'</strong> em conversas informais com amigos, família ou em situações casuais. Elas são muito comuns no inglês falado do dia a dia.</p>
                        <p><strong className="font-semibold text-red-600">Não use essas contrações</strong> em situações formais, como e-mails de trabalho, redações acadêmicas ou apresentações importantes. Nesses casos, prefira as formas completas ("have to", "going to", "want to").</p>
                    </InfoCard>

                    <InfoCard title="Glossário Rápido de Contrações Comuns">
                        <p>Além de 'gotta', 'gonna' e 'wanna', existem outras contrações informais que você ouvirá com frequência. Aqui estão algumas:</p>
                        <div className="mt-4 space-y-3 font-mono">
                             <div className="grid grid-cols-3 gap-2 items-center border-b border-border-gray pb-2 text-sm md:text-base">
                                <strong className="text-slate-600">Contração</strong>
                                <span className="text-slate-600">Forma Completa</span>
                                <span className="text-slate-600">🇧🇷 Significado</span>
                            </div>
                            {glossaryItems.map(item => (
                                <div key={item.contraction} className="grid grid-cols-3 gap-2 items-center border-b border-border-gray/50 py-2 text-base md:text-lg">
                                    <strong className="text-primary">{item.contraction}</strong>
                                    <span className="text-secondary">{item.full}</span>
                                    <span className="text-slate-600">{item.meaning}</span>
                                </div>
                            ))}
                        </div>
                         <p className="text-sm mt-4 text-slate-500 italic">Nota: 'Ain't' é muito informal e, embora comum na fala e na música, às vezes é considerado "inglês incorreto" por falantes nativos. Use com cuidado!</p>
                    </InfoCard>
                </main>
            </div>
        </div>
    );
};

export default UnderstandingGotta;