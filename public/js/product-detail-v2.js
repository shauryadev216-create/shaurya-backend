const API = "https://shaurya-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const orderId = params.get("order_id");

    let productData = null;

    console.log("PAGE LOADED, ID:", id);

    // =========================
    // LOAD PRODUCT
    // =========================
    try {
        const res = await fetch(API + "/products");
        const products = await res.json();

        const product = products.find(p => String(p._id) === String(id));

        if (!product) {
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        productData = product;

        // UI SET
        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;
        document.getElementById("mainImage").src = product.cover;

        const btn = document.getElementById("buyBtn");

        console.log("BUTTON FOUND:", btn);

        // =========================
        // VERIFY PAYMENT (AUTO)
        // =========================
        if (orderId) {
            await verifyAndDownload(id, orderId, productData);
        }

        // =========================
        // BUTTON SETUP (FORCE)
        // =========================
        const purchased = localStorage.getItem("purchased_" + id);

        if (purchased === "true") {
            btn.textContent = "Download";
            btn.onclick = () => downloadProduct(productData);
        } else {
            btn.textContent = "Buy Now";

            btn.addEventListener("click", () => {
                console.log("BUY BUTTON CLICKED");
                window.location.href = "payment.html?id=" + id;
            });
        }

    } catch (err) {
        console.error("LOAD ERROR:", err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
});

// =========================
// VERIFY + AUTO DOWNLOAD
// =========================
async function verifyAndDownload(id, orderId, productData) {

    try {
        const res = await fetch("https://shaurya-backend.onrender.com/verify-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order_id: orderId })
        });

        const data = await res.json();

        console.log("VERIFY RESULT:", data);

        if (data.success) {

            localStorage.setItem("purchased_" + id, "true");

            alert("✅ Payment successful! Download starting...");

            // Clean URL
            window.history.replaceState({}, document.title, "product-template.html?id=" + id);

            downloadProduct(productData);

        } else {
            console.log("❌ Verification failed");
        }

    } catch (err) {
        console.error("VERIFY ERROR:", err);
    }
}

// =========================
// DOWNLOAD
// =========================
function downloadProduct(productData) {

    if (!productData) return;

    let fileUrl = productData.type === "photo"
        ? (productData.original || productData.cover)
        : productData.zip;

    if (!fileUrl) {
        alert("No file available");
        return;
    }

    const link = document.createElement("a");
    link.href = fileUrl;

    const ext = fileUrl.split(".").pop();
    const name = productData.title.replace(/\s+/g, "_");

    link.download = name + "." + ext;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}