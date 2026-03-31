import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmS8L-Wn85RnA5CUxMo9uzKwehcUJjsHM",
  authDomain: "shaurya-dev-project.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =========================
// EMAIL LOGIN
// =========================
window.login = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

        // 🔥 SAVE USER
        localStorage.setItem("userEmail", email);

        alert("Login success");
        window.location.href = "/dashboard.html";

    } catch (err) {
        alert(err.message);
    }
};

// =========================
// GOOGLE LOGIN
// =========================
window.googleLogin = async function () {

    const provider = new GoogleAuthProvider();

    try {

        const result = await signInWithPopup(auth, provider);

        const email = result.user.email;

        // 🔥 SAVE USER
        const email = localStorage.getItem("userEmail");

        alert("Google login success");
        window.location.href = "/dashboard.html";

    } catch (err) {
        alert(err.message);
    }
};