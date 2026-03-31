import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// EMAIL LOGIN
window.login = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login success");
        window.location.href = "/";
    } catch (err) {
        alert(err.message);
    }
};

// GOOGLE LOGIN
window.googleLogin = async function () {

    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
        alert("Google login success");
        window.location.href = "/";
    } catch (err) {
        alert(err.message);
    }
};