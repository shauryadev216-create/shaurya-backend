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

        // BASIC INFO
        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;

        // MAIN IMAGE
        document.getElementById("mainImage").src = product.cover;

        // ==========================
        // PREVIEW IMAGES (🔥 FIXED)
        // ==========================
        const previewRow = document.getElementById("previewRow");

        if (previewRow && product.preview && product.preview.length) {

            previewRow.innerHTML = "";

            product.preview.forEach(img => {
                previewRow.innerHTML += `
                    <img src="${img}" onclick="changeImage('${img}')">
                `;
            });
        }

        // 🔥 IF RETURNED FROM PAYMENT
        if (orderId) {
            verifyPaymentAndDownload();
        }

    } catch (err) {
        console.error(err);
    }
}

// ==========================
// CHANGE IMAGE (THUMB CLICK)
// ==========================
function changeImage(src) {
    document.getElementById("mainImage").src = src;
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

    btn.textContent = "Download Now";
    btn.onclick = startDownload;

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

    if (!productData) {
        alert("❌ Product not loaded");
        return;
    }

    let fileUrl = "";

    if (productData.type === "photo") {

        if (productData.original) {
            fileUrl = productData.original;
        } else {
            alert("❌ Original image missing!");
            return;
        }

    } else if (productData.type === "pack") {

        if (productData.zip) {
            fileUrl = productData.zip;
        } else {
            alert("❌ ZIP file missing!");
            return;
        }

    } else {
        alert("❌ Invalid product type");
        return;
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

        window.location.href = `/payment.html?id=${id}&phone=${phone}&email=${email}`;
    };

    loadProduct();
});