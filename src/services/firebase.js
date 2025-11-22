import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyChLvuNKfte-6fPJxXX1Ch0czwF20AUnHA",
    authDomain: "momo-music-db.firebaseapp.com",
    projectId: "momo-music-db",
    storageBucket: "momo-music-db.firebasestorage.app",
    messagingSenderId: "523987636658",
    appId: "1:523987636658:web:7c503b3066571bb10494ab"
};

let app, db, storage, auth;

try {
    if (firebaseConfig.apiKey !== "여기에_apiKey_붙여넣기") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        storage = getStorage(app);
        auth = getAuth(app);
    }
} catch (e) {
    console.error("Firebase 초기화 에러:", e);
}

export { db, storage, auth };
