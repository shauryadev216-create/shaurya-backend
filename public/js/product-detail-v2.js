document.addEventListener("DOMContentLoaded", () => {

    console.log("JS LOADED ✅");

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const btn = document.getElementById("buyBtn");

    if(!btn){
        console.error("❌ BUTTON NOT FOUND");
        return;
    }

    console.log("✅ BUTTON FOUND");

    // 🔥 FORCE CLICK (ULTIMATE SIMPLE)
    btn.onclick = function () {
        console.log("🔥 CLICK WORKED");

        window.location.href = "/payment.html?id=" + id;
    };

});