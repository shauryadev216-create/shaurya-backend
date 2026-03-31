document.addEventListener("DOMContentLoaded", () => {
    console.log("JS WORKING 🚀");

    const btn = document.getElementById("buyBtn");

    if(!btn){
        console.error("❌ Button not found");
        return;
    }

    console.log("✅ Button found");

    btn.onclick = () => {
        alert("CLICK WORKS ✅");
        window.location.href = "payment.html?id=123";
    };
});