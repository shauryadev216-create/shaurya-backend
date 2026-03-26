import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDmS8L-Wn85RnA5CUxMo9uzKwehcUJjsHM",
  authDomain: "shaurya-dev-project.firebaseapp.com",
  projectId: "shaurya-dev-project",
  storageBucket: "shaurya-dev-project.firebasestorage.app",
  messagingSenderId: "655689702944",
  appId: "1:655689702944:web:a35099d0b07063a523a645"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =========================
// SIGNUP
// =========================
window.signup = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("auth-message");
    const btn = document.getElementById("signupBtn");

    msg.textContent = "";

    btn.classList.add("loading");
    btn.disabled = true;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {

            msg.style.color = "green";
            msg.textContent = "Account created successfully!";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);

        })
        .catch(error => {

            msg.style.color = "red";

            shakeBox();

            switch (error.code) {
                case "auth/email-already-in-use":
                    msg.textContent = "Account already exists. Please login.";
                    break;

                case "auth/invalid-email":
                    msg.textContent = "Invalid email format.";
                    break;

                case "auth/weak-password":
                    msg.textContent = "Password must be at least 6 characters.";
                    break;

                default:
                    msg.textContent = "Something went wrong. Try again.";
            }
        })
        .finally(() => {
            btn.classList.remove("loading");
            btn.disabled = false;
        });
};

// =========================
// LOGIN
// =========================
window.login = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("auth-message");
    const btn = document.getElementById("loginBtn");

    msg.textContent = "";

    btn.classList.add("loading");
    btn.disabled = true;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {

            msg.style.color = "green";
            msg.textContent = "Welcome back!";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);

        })
        .catch(error => {

            msg.style.color = "red";

            shakeBox();

            switch (error.code) {
                case "auth/user-not-found":
                    msg.textContent = "No account found. Create one.";
                    break;

                case "auth/wrong-password":
                    msg.textContent = "Incorrect password.";
                    break;

                case "auth/invalid-email":
                    msg.textContent = "Invalid email format.";
                    break;

                case "auth/too-many-requests":
                    msg.textContent = "Too many attempts. Try later.";
                    break;

                default:
                    msg.textContent = "Something went wrong. Try again.";
            }
        })
        .finally(() => {
            btn.classList.remove("loading");
            btn.disabled = false;
        });
};

// =========================
// SELLER LOGIN
// =========================
window.sellerLogin = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("auth-message");

    const SELLER_EMAIL = "your-email@gmail.com";

    if (email !== SELLER_EMAIL) {
        msg.style.color = "red";
        msg.textContent = "Not authorized as seller.";
        shakeBox();
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "admin/admin.html";
        })
        .catch(() => {
            msg.style.color = "red";
            msg.textContent = "Seller login failed.";
            shakeBox();
        });
};

// =========================
// LOGOUT
// =========================
window.logout = function () {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
};

// =========================
// SHAKE EFFECT
// =========================
function shakeBox() {
    const box = document.querySelector(".login-box");
    box.classList.add("shake");
    setTimeout(() => box.classList.remove("shake"), 300);
}