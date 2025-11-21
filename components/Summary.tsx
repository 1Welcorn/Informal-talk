import React from 'react';

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

interface SummaryProps {
    onBack: () => void;
}

// Fix: Refactored to use a named interface for props to resolve the TypeScript error.
interface KeyPointProps {
    title: string;
    children: React.ReactNode;
}

const KeyPoint: React.FC<KeyPointProps> = ({ title, children }) => (
    <div className="bg-white border border-border-gray p-6 rounded-xl shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">{title}</h3>
        <div className="text-base md:text-lg text-slate-700 space-y-3">
            {children}
        </div>
    </div>
);


const Summary: React.FC<SummaryProps> = ({ onBack }) => {
    return (
        <div className="h-full w-full bg-background text-secondary flex flex-col p-4 md:p-8 lg:p-12 animate-fade-in relative overflow-y-auto">
            <div className="absolute top-4 left-4 z-10">
                 <button onClick={onBack} className={`bg-white hover:bg-light-gray border border-border-gray transition-all duration-300 text-secondary font-bold rounded-lg shadow-sm py-2 px-4 md:py-2 md:px-5 text-base md:text-lg`}>
                    &larr; Main Menu
                </button>
            </div>
            
            <div className="w-full mx-auto my-auto">
                <header className="text-center mb-10 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold">3. Summary</h1>
                    <p className="text-lg md:text-xl mt-3 text-slate-600">Key Points to Remember</p>
                </header>

                <main className="space-y-6">
                    <KeyPoint title="Gotta = 'Have got to'">
                        <p>Use <strong className="font-semibold text-primary">'Gotta'</strong> to express <strong className="font-semibold text-primary">necessity or obligation</strong>.</p>
                        <div className="bg-light-gray p-4 rounded-lg my-2 border border-border-gray">
                           <code className="text-base md:text-lg text-secondary">[Subject] + gotta + [Base Verb]</code>
                        </div>
                        <p>Example: <strong className="font-semibold text-primary">"I gotta study for the test."</strong></p>
                    </KeyPoint>

                    <KeyPoint title="Gonna = 'Going to'">
                        <p>Use <strong className="font-semibold text-primary">'Gonna'</strong> to talk about <strong className="font-semibold text-primary">future plans</strong> or intentions.</p>
                        <div className="bg-light-gray p-4 rounded-lg my-2 border border-border-gray">
                           <code className="text-base md:text-lg text-secondary">[Subject] + am/is/are + gonna + [Verb]</code>
                        </div>
                        <p>Example: <strong className="font-semibold text-primary">"She's gonna travel tomorrow."</strong></p>
                    </KeyPoint>
                    
                     <KeyPoint title="Wanna = 'Want to'">
                        <p>Use <strong className="font-semibold text-primary">'Wanna'</strong> to express a <strong className="font-semibold text-primary">desire or wish</strong> to do something.</p>
                        <div className="bg-light-gray p-4 rounded-lg my-2 border border-border-gray">
                           <code className="text-base md:text-lg text-secondary">[Subject] + wanna + [Base Verb]</code>
                        </div>
                        <p>Example: <strong className="font-semibold text-primary">"They wanna order pizza."</strong></p>
                    </KeyPoint>


                    <KeyPoint title="When to Use">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <CheckIcon className="h-7 w-7 text-green-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg text-green-600">Use</h4>
                                    <p>In everyday conversations, with friends, family, in movies, music, etc. It's natural and casual English.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <XCircleIcon className="h-7 w-7 text-red-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg text-red-600">Don't Use</h4>
                                    <p>In formal emails, work presentations, proficiency tests, or any situation that requires formal language.</p>
                                </div>
                            </div>
                        </div>
                    </KeyPoint>
                </main>
                 <footer className="text-center mt-12 mb-6">
                    <p className="text-lg md:text-xl font-bold text-primary">Congratulations on completing the guide!</p>
                    <p className="text-lg md:text-xl mt-2 text-slate-700">Keep practicing to feel more and more confident.</p>
                    <button onClick={onBack} className="mt-6 bg-primary text-white hover:bg-primary/90 font-bold rounded-lg shadow-md py-3 px-8 text-lg md:text-xl transition-all">
                        Back to Main Menu
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default Summary;