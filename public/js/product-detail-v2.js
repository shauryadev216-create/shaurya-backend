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

        // ================= TITLE =================
        document.getElementById("title").textContent = product.title;

        // ================= DESCRIPTION (FIXED PERFECTLY) =================
        document.getElementById("description").innerHTML =
            product.description || "";

        // ================= PRICE SYSTEM (FINAL FIX) =================
        const priceBox = document.getElementById("price");

        const price = Number(product.price);
        const original = Number(product.originalPrice || 0);

        if(original && original > price){

            const discount = Math.round(((original - price) / original) * 100);

            priceBox.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                    <span style="color:#ff4d4d; font-weight:600;">
                        -${discount}%
                    </span>

                    <span style="text-decoration:line-through; color:#888;">
                        ₹${original}
                    </span>
                </div>

                <div style="font-size:26px; font-weight:700;">
                    ₹${price}
                </div>
            `;
        }else{
            priceBox.innerHTML = `<b style="font-size:26px;">₹${price}</b>`;
        }

        // ================= MAIN IMAGE =================
        document.getElementById("mainImage").src = product.cover;

        // ================= PREVIEW IMAGES =================
        const previewRow = document.getElementById("previewRow");

        if (previewRow && product.preview && product.preview.length) {

            previewRow.innerHTML = "";

            product.preview.forEach((img, index) => {
                previewRow.innerHTML += `
                    <img src="${img}" onclick="changeImage('${img}')">
                `;
            });
        }

        // ================= PAYMENT RETURN =================
        if (orderId) {
            verifyPaymentAndDownload();
        }

    } catch (err) {
        console.error(err);
    }
}

// ==========================
// CHANGE IMAGE
// ==========================
function changeImage(src) {
    document.getElementById("mainImage").src = src;
}

// ==========================
// VERIFY PAYMENT
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

        showDownloadUI();

    } catch (err) {
        console.error(err);
    }
}

// ==========================
// DOWNLOAD UI
// ==========================
function showDownloadUI() {

    const btn = document.getElementById("buyBtn");

    btn.textContent = "Download Now";
    btn.onclick = startDownload;

    const msg = document.createElement("p");
    msg.style.marginTop = "10px";
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

    if (!productData) {
        alert("❌ Product not loaded");
        return;
    }

    let fileUrl = "";

    if (productData.type === "photo") {
        fileUrl = productData.original;
    } else {
        fileUrl = productData.zip;
    }

    fetch(fileUrl)
        .then(res => res.blob())
        .then(blob => {

            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;

            let ext = fileUrl.split(".").pop().split("?")[0];
            link.download = productData.title + "." + ext;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

        })
        .catch(err => {
            console.error(err);
            alert("❌ Download failed");
        });
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("buyBtn");

    btn.onclick = function () {

    const phone = document.getElementById("userPhone").value;
    const email = document.getElementById("userEmail").value;

    if (!phone || !email) {
        alert("Enter phone & email");
        return;
    }

    window.location.href =
        `/checkout.html?id=${id}&phone=${phone}&email=${email}`;
};

    loadProduct();
});