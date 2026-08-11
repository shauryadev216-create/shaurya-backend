const API = "/api";

// =====================================================
// ADMIN LOGIN
// =====================================================

async function loginAdmin() {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const message =
        document.getElementById("message");

    const loginBtn =
        document.getElementById("loginBtn");


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!username || !password) {

        message.textContent =
            "Enter username and password.";

        message.style.color =
            "red";

        return;
    }


    // =================================================
    // BUTTON
    // =================================================

    loginBtn.disabled =
        true;

    loginBtn.textContent =
        "Logging in...";


    try {

        // =================================================
        // SEND LOGIN REQUEST
        // =================================================

        const res =
            await fetch(
                API + "/admin-login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            username:
                                username,

                            password:
                                password
                        })
                }
            );


        const data =
            await res.json();


        console.log(
            "ADMIN LOGIN RESPONSE:",
            data
        );


        // =================================================
        // LOGIN FAILED
        // =================================================

        if (
            !res.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                "Invalid username or password.";

            message.style.color =
                "red";

            loginBtn.disabled =
                false;

            loginBtn.textContent =
                "Login";

            return;
        }


        // =================================================
        // LOGIN SUCCESS
        // =================================================

        message.textContent =
            "Login successful!";

        message.style.color =
            "green";


        setTimeout(
            () => {

                window.location.href =
                    "/admin/admin.html";

            },
            500
        );

    }

    catch (error) {

        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );


        message.textContent =
            "Could not connect to server.";

        message.style.color =
            "red";


        loginBtn.disabled =
            false;

        loginBtn.textContent =
            "Login";
    }
}


// =====================================================
// BUTTON
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginBtn =
            document.getElementById(
                "loginBtn"
            );


        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                loginAdmin
            );
        }


        // Allow Enter key
        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    loginAdmin();
                }
            }
        );
    }
);