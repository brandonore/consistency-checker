import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6f7F1PMWIZ6KFQdgR61sGCsQBuiQrq0Y",
  authDomain: "tvbacktest-c7628.firebaseapp.com",
  projectId: "tvbacktest-c7628",
  storageBucket: "tvbacktest-c7628.appspot.com",
  messagingSenderId: "1096700864238",
  appId: "1:1096700864238:web:c058c1639ae1d5bb21b5ff",
  measurementId: "G-MVBLNJFL2H",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

// if (location.hostname === "localhost") {
//   connectFirestoreEmulator(db, "localhost", 8081);
//   connectStorageEmulator(storage, "localhost", 9199);
// }

export { db, auth, storage, functions, httpsCallable, analytics };
