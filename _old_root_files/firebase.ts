
// Fix: Switched to Firebase v9 compat libraries to support v8 syntax.
// Fix: Use the imported firebase namespace directly for runtime calls.
import * as firebaseNs from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { firebaseConfig } from "./firebaseConfig";

console.log("[DEBUG] firebase.ts loaded.");

// Check if the firebaseConfig has been filled out.
export const isFirebaseConfigured = firebaseConfig && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";
console.log(`[DEBUG] isFirebaseConfigured: ${isFirebaseConfigured}`);


let db: any;
let auth: any;
let googleProvider: any;

if (isFirebaseConfigured) {
    // Check that the firebaseNs object was resolved correctly from the import.
    if (firebaseNs && typeof firebaseNs.initializeApp === 'function') {
        try {
            console.log("[DEBUG] Attempting to initialize Firebase...");
            // Initialize Firebase only if it hasn't been initialized yet.
            if (!firebaseNs.apps.length) {
                firebaseNs.initializeApp(firebaseConfig);
                console.log("[DEBUG] firebase.initializeApp() called successfully.");
            } else {
                console.log("[DEBUG] Firebase was already initialized.");
            }
            // Initialize Cloud Firestore and get a reference to the service
            db = firebaseNs.firestore();
            console.log("[DEBUG] firebase.firestore() service obtained.");

            auth = firebaseNs.auth();
            console.log("[DEBUG] firebase.auth() service obtained.");

            googleProvider = new firebaseNs.auth.GoogleAuthProvider();
            console.log("[DEBUG] GoogleAuthProvider created.");

        } catch (error) {
            console.error(
                "[DEBUG] Firebase initialization FAILED. Progress saving will be disabled.",
                error
            );
            // Force auth to be null so the mock objects are created
            auth = null;
        }
    } else {
        console.error("[DEBUG] Firebase app object could not be resolved from the import. Progress saving is disabled.");
        auth = null;
    }
} else {
    console.warn(
        "[DEBUG] Firebase is not configured. Progress saving will be disabled. " +
        "Please add your Firebase credentials to `firebaseConfig.ts`."
    );
}

// If Firebase is not configured OR initialization failed, create mock objects to prevent the app from crashing.
if (!isFirebaseConfigured || !auth) {
    console.log("[DEBUG] Firebase not available. Creating mock services.");
    db = {
        collection: () => ({
            doc: () => ({
                onSnapshot: () => () => {}, // Returns an empty unsubscribe function
                set: () => Promise.resolve(),
            }),
        }),
    };
    auth = {
        onAuthStateChanged: (callback: (user: any | null) => void) => {
            console.log("[DEBUG] Mock onAuthStateChanged called.");
            // Immediately invoke the callback with null asynchronously to signify initialization is complete.
            setTimeout(() => callback(null), 0);
            // Return an empty unsubscribe function.
            return () => {};
        },
        signInWithPopup: () => Promise.reject(new Error("Firebase not configured")),
        signOut: () => Promise.resolve(),
    };
    googleProvider = {};
}

// Export types for use in other components
// Use the imported namespace for type information.
export type FirebaseUser = firebaseNs.User;
export type FirebaseAuthError = firebaseNs.auth.Error;


export { db, auth, googleProvider };