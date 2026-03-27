
console.log("JS LOADED SUCCESSFULLY 🚀");

// =========================
// CONFIG
// =========================
const API = "https://shaurya-backend.onrender.com";

// =========================
// GET URL PARAMS
// =========================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const orderId = params.get("order_id");

// =========================
// LOAD PRODUCT FROM SERVER
// =========================
async function loadProduct() {

    // 🚨 DEBUG
    console.log("Product ID from URL:", id);

    if (!id) {
        document.body.innerHTML = "<h1>No Product ID</h1>";
        return;
    }

    try {
        const res = await fetch(API + "/products");

        // 🚨 CHECK RESPONSE
        if (!res.ok) {
            throw new Error("API failed");
        }

        const products = await res.json();

        console.log("All products:", products);

        // ✅ FIXED MATCH (handles both id and _id)
        const product = products.find(p => String(p._id) === String(id));

        console.log("Found product:", product);

        if (!product) {
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        // =========================
        // SET DATA
        // =========================
        document.getElementById("title").textContent = product.title || "No title";
        document.getElementById("description").textContent = product.description || "No description";
        document.getElementById("price").textContent = "$" + (product.price || 0);

        // =========================
        // IMAGE FIX
        // =========================
        let image = product.type === "photo"
            ? product.cover
            : (product.preview?.[0] || product.cover);

        const mainImage = document.getElementById("mainImage");

        if (image && image.startsWith("http")) {
            mainImage.src = image;
        } else {
            mainImage.src = "https://via.placeholder.com/400";
        }

        const lightbox = document.getElementById("lightboxImg");
        if (lightbox) {
            lightbox.src = mainImage.src;
        }

        // =========================
        // BUTTON LOGIC
        // =========================
        const buyBtn = document.getElementById("buyBtn");

        function updateButton() {
            const purchased = localStorage.getItem("purchased_" + id);

            if (purchased === "true") {
                buyBtn.textContent = "Download";
                buyBtn.onclick = downloadProduct;
            } else {
                buyBtn.textContent = "Buy Now";
                buyBtn.onclick = () => {
                    window.location.href = "payment.html?id=" + id;
                };
            }
        }

        // =========================
        // VERIFY PAYMENT
        // =========================
        async function verifyPayment() {

            if (!orderId) {
                updateButton();
                return;
            }

            try {
                const res = await fetch(API + "/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order_id: orderId })
                });

                const data = await res.json();

                if (data.success) {
                    localStorage.setItem("purchased_" + id, "true");
                }

            } catch (err) {
                console.error("Verify failed", err);
            }

            updateButton();
        }

        verifyPayment();

        // =========================
        // DOWNLOAD
        // =========================
        function downloadProduct() {

            if (product.type === "photo") {
                window.open(product.original || product.cover);
            } else {
                window.open(product.zip);
            }
        }

    } catch (err) {
        console.error("LOAD ERROR:", err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

// =========================
// INIT
// =========================
loadProduct();