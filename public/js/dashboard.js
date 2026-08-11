import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const API = "https://shaurya-backend.onrender.com";

const auth = getAuth();

// ==========================
// LOAD DASHBOARD
// ==========================
auth.onAuthStateChanged(async (user) => {

    if(!user){
        alert("Login required");
        window.location.href = "/login.html";
        return;
    }

    const email = user.email;

    const res = await fetch(API + "/my-purchases/" + email);
    const purchases = await res.json();

    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");

    if(!purchases.length){
        empty.style.display = "block";
        return;
    }

    for(let item of purchases){

        const product = item.product;

        // 🔥 VERIFY PAYMENT
        const verify = await fetch(API + "/verify-payment", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({ order_id: item.order_id })
        });

        const verifyData = await verify.json();

        // ❌ NOT PAID → SKIP
        if(!verifyData.success) continue;

        // ==========================
        // CARD
        // ==========================
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <img src="${product.cover}">
            <h3>${product.title}</h3>

            <button class="download-btn"
            onclick='download("${product.type}","${product.original || product.zip}","${product.title}")'>
                Download
            </button>
        `;

        grid.appendChild(div);
    }
});

// ==========================
// DOWNLOAD
// ==========================
window.download = async function(type, url, title){

    const res = await fetch(url);
    const blob = await res.blob();

    const link = document.createElement("a");

    const blobUrl = URL.createObjectURL(blob);
    link.href = blobUrl;

    let ext = url.split(".").pop().split("?")[0];
    link.download = title + "." + ext;

    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(blobUrl);
};