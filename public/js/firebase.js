// FIREBASE CORE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// STORAGE
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// 🔥 YOUR CONFIG (PASTE YOURS HERE)
const firebaseConfig = {
  aapiKey: "AIzaSyDmS8L-Wn85RnA5CUxMo9uzKwehcUJjsHM",
  authDomain: "shaurya-dev-project.firebaseapp.com",
  projectId: "shaurya-dev-project",
  storageBucket: "shaurya-dev-project.firebasestorage.app",
  messagingSenderId: "655689702944",
  appId: "1:655689702944:web:a35099d0b07063a523a645"
};

// INIT
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// EXPORT
export { storage, ref, uploadBytes, getDownloadURL };