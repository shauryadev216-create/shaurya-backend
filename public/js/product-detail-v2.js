const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const orderId = params.get("order_id");

let productData = null;

// ==========================
// LOAD PRODUCT
// ==========================
async function loadProduct() {
    try {
        const res = await fetch(API + "/products");
        const products = await res.json();

        const product = products.find(p => String(p._id) === String(id));

        if (!product) {
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        productData = product;

        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;
        document.getElementById("mainImage").src = product.cover;

        // 🔥 IF RETURNED FROM PAYMENT
        if (orderId) {
            verifyPaymentAndDownload();
        }

    } catch (err) {
        console.error(err);
    }
}

// ==========================
// VERIFY PAYMENT + DOWNLOAD
// ==========================
async function verifyPaymentAndDownload() {
    try {

        const res = await fetch(API + "/verify-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order_id: orderId })
        });

        const data = await res.json();

        if (!data.success) {
            alert("Payment verification failed ❌");
            return;
        }

        // ✅ PAYMENT SUCCESS
        showDownloadUI();

    } catch (err) {
        console.error(err);
    }
}

// ==========================
// SHOW DOWNLOAD SYSTEM
// ==========================
function showDownloadUI() {

    const btn = document.getElementById("buyBtn");

    // 🔁 Convert button
    btn.textContent = "Download Now";
    btn.onclick = startDownload;

    // ⏳ Countdown UI
    const msg = document.createElement("p");
    msg.id = "downloadMsg";
    msg.style.marginTop = "10px";
    msg.style.fontSize = "18px";
    msg.style.color = "green";

    document.body.appendChild(msg);

    let count = 5;

    const interval = setInterval(() => {
        msg.textContent = `Download starting in ${count}s...`;

        count--;

        if (count < 0) {
            clearInterval(interval);
            startDownload();
        }

    }, 1000);
}

// ==========================
// DOWNLOAD FILE
// ==========================
function startDownload() {

    if (!productData || !productData.zip) {
        alert("Download not available");
        return;
    }

    const link = document.createElement("a");
    link.href = productData.zip;
    link.download = productData.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================
// BUY BUTTON CLICK
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("buyBtn");

    btn.onclick = function () {
        window.location.href = "/payment.html?id=" + id;
    };

    loadProduct();
});