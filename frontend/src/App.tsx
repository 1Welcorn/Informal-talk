


import React, { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import DialoguePractice from './components/DialoguePractice';
import UnderstandingGotta from './components/UnderstandingGotta';
import Summary from './components/Summary';
import { db, auth, isFirebaseConfigured, FirebaseUser } from './firebase';

const App: React.FC = () => {
    const [currentSection, setCurrentSection] = useState<string | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioCache] = useState(() => new Map<string, AudioBuffer>());
    const [completedDialogues, setCompletedDialogues] = useState<number[]>([]);
    const [formalityScore, setFormalityScore] = useState<{correct: number, total: number} | null>(null);
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [authInitialized, setAuthInitialized] = useState(false);

    // Effect for initializing the AudioContext on user interaction
    useEffect(() => {
        const initAudioContext = () => {
            if (!audioContext) {
                const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                setAudioContext(context);
            }
            window.removeEventListener('click', initAudioContext);
            window.removeEventListener('keydown', initAudioContext);
        };
        window.addEventListener('click', initAudioContext);
        window.addEventListener('keydown', initAudioContext);

        return () => {
            window.removeEventListener('click', initAudioContext);
            window.removeEventListener('keydown', initAudioContext);
        };
    }, [audioContext]);

    // Effect for listening to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: FirebaseUser | null) => {
            setUser(user as FirebaseUser | null);
            setAuthInitialized(true);
        });
        return () => unsubscribe();
    }, []);

    // Effect for fetching user progress from Firestore when user logs in/out
    useEffect(() => {
        if (!user || !isFirebaseConfigured) {
            setCompletedDialogues([]); // Clear progress on sign out or if Firebase is not configured
            return;
        }

        const progressDocRef = db.collection("progress").doc(user.uid);
        const unsubscribe = progressDocRef.onSnapshot((doc: any) => {
            if (doc.exists) {
                const data = doc.data();
                setCompletedDialogues(data?.completed || []);
                setFormalityScore(data?.formalityScore || null);
            } else {
                setCompletedDialogues([]);
                setFormalityScore(null);
            }
        });

        return () => unsubscribe(); // Cleanup listener on unmount or user change
    }, [user]);
    
    const handleStart = (sectionId: string) => {
        setCurrentSection(sectionId);
    };

    const handleBack = () => {
        setCurrentSection(null);
    };
    
    const handleDialogueComplete = async (dialogueId: number) => {
        // Only save progress if a user is logged in and Firebase is configured
        if (!user || completedDialogues.includes(dialogueId) || !isFirebaseConfigured) return;

        const newCompleted = [...completedDialogues, dialogueId].sort((a,b) => a-b);
        setCompletedDialogues(newCompleted);

        try {
            const progressDocRef = db.collection("progress").doc(user.uid);
            await progressDocRef.set({ completed: newCompleted }, { merge: true });
        } catch (err) {
            // Fix: Changed 'error' variable to 'err' to avoid potential naming conflicts.
            console.error("Error saving progress to Firebase:", err);
            // Optionally, handle the error, e.g., show a notification
        }
    };
    
    const handleFormalityComplete = async (correct: number, total: number) => {
        // Save formality practice score
        if (!user || !isFirebaseConfigured) return;
        
        const score = { correct, total };
        setFormalityScore(score);
        
        try {
            const progressDocRef = db.collection("progress").doc(user.uid);
            await progressDocRef.set({ formalityScore: score }, { merge: true });
            console.log("Formality score saved:", score);
        } catch (err) {
            console.error("Error saving formality score:", err);
        }
    };

    return (
        <main className="h-screen w-screen bg-background">
             {(() => {
                // Fix: Inlined renderContent logic to resolve all scoping errors.
                switch (currentSection) {
                    case 'section-1':
                        return <UnderstandingGotta onBack={handleBack} onNavigate={handleStart} audioContext={audioContext} audioCache={audioCache} />;
                    case 'section-2':
                        return <DialoguePractice onBack={handleBack} audioCache={audioCache} audioContext={audioContext} completedDialogues={completedDialogues} onDialogueComplete={handleDialogueComplete} onFormalityComplete={handleFormalityComplete} formalityScore={formalityScore} />;
                    case 'section-3':
                        return <Summary onBack={handleBack} />;
                    default:
                        return <Welcome onStart={handleStart} user={user} authInitialized={authInitialized} isFirebaseConfigured={isFirebaseConfigured} />;
                }
            })()}
        </main>
    );
};

export default App;