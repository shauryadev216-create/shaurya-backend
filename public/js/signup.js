import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =========================
// EMAIL SIGNUP
// =========================
window.signup = async function(){

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try{

        await createUserWithEmailAndPassword(auth, email, password);

        localStorage.setItem("userEmail", email);

        alert("Account created!");
        window.location.href = "/dashboard.html";

    }catch(err){
        alert(err.message);
    }
};

// =========================
// GOOGLE SIGNUP (🔥 FIXED)
// =========================
window.googleSignup = async function(){

    const provider = new GoogleAuthProvider();

    try{

        const result = await signInWithPopup(auth, provider);

        const email = result.user.email;

        localStorage.setItem("userEmail", email);

        alert("Google signup success!");
        window.location.href = "/dashboard.html";

    }catch(err){
        alert(err.message);
    }
};