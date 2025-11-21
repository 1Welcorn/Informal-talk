


import React, { useState } from 'react';
import { auth, googleProvider, FirebaseUser, FirebaseAuthError } from '../firebase';

interface WelcomeProps {
    onStart: (sectionId: string) => void;
    user: FirebaseUser | null;
    authInitialized: boolean;
    isFirebaseConfigured: boolean;
}

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.582-3.344-11.227-7.914l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.39,44,30.134,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const Welcome: React.FC<WelcomeProps> = ({ onStart, user, authInitialized, isFirebaseConfigured }) => {
    const handleSignIn = () => {
        auth.signInWithPopup(googleProvider).catch((error: FirebaseAuthError) => {
            console.error("Google Sign-In Error:", error.code, error.message);
            let errorMessage = "Could not sign in. Please try again.";

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    // This is a common case where the user intentionally closes the window.
                    // No alert is needed, just log it for debugging.
                    console.log("Sign-in popup closed by user.");
                    return; 
                case 'auth/popup-blocked-by-browser':
                    errorMessage = "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
                    break;
                case 'auth/cancelled-popup-request':
                     errorMessage = "Sign-in was cancelled. If you have multiple sign-in windows open, please close them and try again.";
                     break;
                case 'auth/account-exists-with-different-credential':
                    errorMessage = "An account already exists with this email, but it was created with a different sign-in method.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Could not connect to the server. Please check your internet connection and try again.";
                    break;
            }
            alert(errorMessage);
        });
    };

    const handleSignOut = () => {
        auth.signOut();
    };
    
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationInfo("Geolocation is not supported by your browser.");
            return;
        }

        setIsFetchingLocation(true);
        setLocationInfo("Fetching location...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocationInfo(`Latitude: ${latitude}\nLongitude: ${longitude}`);
                setIsFetchingLocation(false);
            },
            (error) => {
                let errorMessage = "An error occurred while retrieving your location.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "You denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request to get user location timed out.";
                        break;
                }
                setLocationInfo(errorMessage);
                setIsFetchingLocation(false);
            }
        );
    };

    const renderContent = () => {
        if (!authInitialized) {
            return (
                <div className='mt-8 w-full max-w-lg mx-auto'>
                    <p className="font-medium text-lg md:text-xl mb-4">Initializing...</p>
                    <div className="w-full bg-light-gray rounded-full h-3 overflow-hidden shadow-inner border border-border-gray">
                        <div className="bg-accent h-3 rounded-full animate-pulse"></div>
                    </div>
                </div>
            );
        }

        if (user) {
            return (
                <>
                    <p className="font-medium transition-all text-xl md:text-2xl">Welcome, {user.displayName}! Choose a section to begin.</p>
                    <nav className="mt-8 flex flex-col md:flex-row justify-center gap-5">
                        <button onClick={() => onStart('section-1')} className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-4 px-8">
                            01. Understanding
                        </button>
                        <button onClick={() => onStart('section-2')} className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-4 px-8">
                            02. Practicing
                        </button>
                        <button onClick={() => onStart('section-3')} className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-4 px-8">
                            03. Summary
                        </button>
                    </nav>
                     <div className="mt-8">
                        <button onClick={handleSignOut} className="text-slate-500 hover:text-primary hover:underline font-medium transition-all">
                            Sign Out
                        </button>
                    </div>
                </>
            );
        }
        
        if (!isFirebaseConfigured) {
             return (
                <div className="mt-8 max-w-2xl mx-auto">
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md text-left" role="alert">
                        <p className="font-bold">Firebase Not Configured</p>
                        <p>Progress saving is disabled. To enable this feature, please add your Firebase project credentials to the <code>firebaseConfig.ts</code> file.</p>
                    </div>
                     <p className="font-medium transition-all text-xl md:text-2xl mt-8">You can still explore the sections:</p>
                    <nav className="mt-4 flex flex-col md:flex-row justify-center gap-5">
                         <button onClick={() => onStart('section-1')} className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-4 px-8">
                            01. Understanding
                        </button>
                        <button onClick={() => onStart('section-2')} className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-4 px-8">
                            02. Practicing
                        </button>
                        <button onClick={() => onStart('section-3')} className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-4 px-8">
                            03. Summary
                        </button>
                    </nav>
                </div>
            );
        }

        return (
            <div className="mt-8">
                <p className="font-medium transition-all text-xl md:text-2xl mb-6">Sign in to save your progress and get started.</p>
                <button 
                    onClick={handleSignIn} 
                    className="bg-white hover:bg-light-gray transition-all duration-300 text-secondary font-bold rounded-lg shadow-md w-full md:w-auto text-lg md:text-xl py-3 px-6 inline-flex items-center justify-center border border-border-gray"
                >
                    <GoogleIcon className="w-6 h-6 mr-3" />
                    Sign in with Google
                </button>
            </div>
        );
    };
    
    return (
        <div className="h-full w-full bg-background text-secondary flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="space-y-12 w-full">
                <div>
                    <h1 className="font-extrabold text-primary mb-3 transition-all text-5xl md:text-7xl">Mastering 'Gotta', 'Gonna', & 'Wanna'</h1>
                    <h2 className="font-normal text-slate-600 transition-all text-xl md:text-2xl">A guide for Brazilian students to master casual English contractions.</h2>
                </div>

                <div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Welcome;