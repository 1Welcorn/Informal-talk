

export interface Dialogue {
    id: number;
    title: string;
    locationSentence: string;
    promptPrefix: string;
    blankType: 'shopping' | 'action' | 'custom';
    correctWord: string | string[];
    words?: string[];
}

export interface FormalityScenario {
  id: number;
  context: string;
  sentence: [string, string]; // ["start", "end"]
  options: { formal: string; informal: string };
  correct: 'formal' | 'informal';
  feedback: string;
}

export const formalityScenarios: FormalityScenario[] = [
  {
    id: 1,
    context: 'You are writing an important email to your boss.',
    sentence: ['I ', ' finish the report by 5 PM.'],
    options: { formal: 'have to', informal: 'gotta' },
    correct: 'formal',
    feedback: 'Correct! In professional writing, using the full phrase "have to" is more appropriate.'
  },
  {
    id: 2,
    context: 'You are talking to your best friend on the phone.',
    sentence: ['Hey, I ', ' go now, my pizza is here!'],
    options: { formal: 'have to', informal: 'gotta' },
    correct: 'informal',
    feedback: 'Exactly! With a close friend, "gotta" sounds natural and is very common.'
  },
  {
    id: 3,
    context: 'You are giving a presentation at a conference.',
    sentence: ["We ", " consider the long-term effects."],
    options: { formal: 'are going to', informal: 'gonna' },
    correct: 'formal',
    feedback: 'Right. "Are going to" is the clear, formal choice for a professional presentation.'
  },
  {
    id: 4,
    context: "You're making weekend plans with your partner.",
    sentence: ["I'm ", " watch a movie tonight, you in?"],
    options: { formal: 'going to', informal: 'gonna' },
    correct: 'informal',
    feedback: 'Perfect! "Gonna" is the ideal choice for everyday, casual conversations.'
  },
  {
    id: 5,
    context: 'A waiter is asking for your order at a fancy restaurant.',
    sentence: ['I ', ' try the salmon, please.'],
    options: { formal: 'want to', informal: 'wanna' },
    correct: 'formal',
    feedback: 'Good choice. While "wanna" might be understood, "want to" is more polite and standard in service situations.'
  },
  {
    id: 6,
    context: "You're texting your sibling about what to eat.",
    sentence: ['do u ', ' order thai food?'],
    options: { formal: 'want to', informal: 'wanna' },
    correct: 'informal',
    feedback: "That's it! In texting and very casual speech, 'wanna' is used almost all the time."
  }
];

export const dialogueData: Dialogue[] = [
    { 
        id: 1, 
        title: "'Gotta' at the Mall", 
        locationSentence: "I've gotta go to the mall.",
        promptPrefix: "I've gotta buy", 
        blankType: 'shopping', 
        correctWord: ['a new pair of jeans', 'a birthday gift'],
        words: ['a new pair of jeans', 'a prescription', 'a birthday gift', 'a train ticket', 'gasoline', 'stamps'] 
    },
    { 
        id: 2, 
        title: "'Gotta' at the Bank", 
        locationSentence: "I've gotta go to the bank.",
        promptPrefix: "I've gotta", 
        blankType: 'action', 
        correctWord: ['deposit my paycheck', 'withdraw some cash'],
        words: ['deposit my paycheck', 'return a book', 'withdraw some cash', 'get a passport photo', 'buy stamps', 'pick up a prescription']
    },
    { 
        id: 3, 
        title: "'Gotta' at Home", 
        locationSentence: "I've gotta go home.",
        promptPrefix: "I've gotta", 
        blankType: 'action', 
        correctWord: ['vacuum the carpet', 'do the laundry'],
        words: ['vacuum the carpet', 'do the laundry', 'catch a bus', 'board a plane', 'attend a meeting', 'check into a hotel']
    },
    {
        id: 4,
        title: "'Gonna' for Weekend Plans",
        locationSentence: "Let's talk about the weekend.",
        promptPrefix: "I'm gonna",
        blankType: 'action',
        correctWord: ['visit my family', 'read a book'],
        words: ['visit my family', 'read a book', 'my homework', 'a shower', 'the bus', 'to bed']
    },
    {
        id: 5,
        title: "'Gonna' for Dinner Plans",
        locationSentence: "I'm feeling hungry.",
        promptPrefix: "For dinner, I'm gonna make",
        blankType: 'action',
        correctWord: ['a big salad', 'some pasta'],
        words: ['a big salad', 'some pasta', 'my bed', 'a phone call', 'a mistake', 'a mess']
    },
    {
        id: 6,
        title: "'Gonna' for Project Deadlines",
        locationSentence: "The project is due tomorrow.",
        promptPrefix: "I'm gonna",
        blankType: 'action',
        correctWord: ['work late tonight', 'finish it now'],
        words: ['work late tonight', 'finish it now', 'go to a party', 'watch TV all day', 'ignore it', 'start tomorrow']
    },
    {
        id: 7,
        title: "'Wanna' at a Coffee Shop",
        locationSentence: "Let's grab a coffee.",
        promptPrefix: "I wanna order",
        blankType: 'action',
        correctWord: ['a cappuccino', 'a latte'],
        words: ['a cappuccino', 'a latte', 'the menu', 'the bill', 'a napkin', 'a table']
    },
    {
        id: 8,
        title: "'Wanna' for Evening Plans",
        locationSentence: "What should we do tonight?",
        promptPrefix: "I wanna",
        blankType: 'action',
        correctWord: ['watch a movie', 'play video games'],
        words: ['watch a movie', 'play video games', 'go to the bank', 'mow the lawn', 'get a tan', 'attend a morning meeting']
    },
    {
        id: 9,
        title: "'Wanna' for Hobbies",
        locationSentence: "I have some free time this year.",
        promptPrefix: "I wanna learn to",
        blankType: 'action',
        correctWord: ['play the guitar', 'speak Japanese'],
        words: ['play the guitar', 'speak Japanese', 'complain about it', 'do my taxes', 'forget my keys', 'get stuck in traffic']
    },
    { 
        id: 10, 
        title: 'Create Your Own Dialogue', 
        locationSentence: '', // Not used for this dialogue type
        promptPrefix: "I've gotta", 
        blankType: 'custom', 
        correctWord: 'type your own activity here' 
    }
];

// --- IndexedDB Audio Cache ---
const DB_NAME = 'AudioDatabase';
const STORE_NAME = 'audioStore';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const initDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'text' });
            }
        };
    });
    return dbPromise;
};

export const saveAudio = async (text: string, audioData: Uint8Array): Promise<void> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put({ text, audioData });
    } catch (error) {
        console.error("Failed to save audio to IndexedDB:", error);
    }
};

export const getAudio = async (text: string): Promise<Uint8Array | null> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(text);

        return new Promise((resolve) => {
            request.onsuccess = () => {
                resolve(request.result ? request.result.audioData : null);
            };
            request.onerror = () => {
                console.error('Error getting audio from IndexedDB:', request.error);
                resolve(null);
            };
        });
    } catch (error) {
        console.error("Failed to get audio from IndexedDB:", error);
        return null;
    }
};