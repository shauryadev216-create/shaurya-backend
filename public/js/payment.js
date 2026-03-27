// =========================
// CONFIG
// =========================
const API = "https://shaurya-backend.onrender.com";

// =========================
// GET PRODUCT ID FROM URL
// =========================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("👉 URL ID:", id);

if (!id) {
    alert("No product ID in URL");
    throw new Error("Missing ID");
}

// =========================
// LOAD PRODUCT FROM SERVER
// =========================
async function loadProduct() {

    try {
        const res = await fetch(API + "/products");

        if (!res.ok) {
            throw new Error("Failed to fetch products");
        }

        const products = await res.json();

        console.log("📦 All Products:", products);

        const product = products.find(p => String(p._id) === String(id));

        console.log("🎯 Found Product:", product);

        if (!product) {
            alert("Product not found");
            throw new Error("Product not found");
        }

        startPayment(product);

    } catch (err) {
        console.error("❌ LOAD ERROR:", err);
        alert("Error loading product");
    }
}

// =========================
// CREATE ORDER + PAYMENT
// =========================
async function startPayment(product) {

    try {

        console.log("💰 Starting payment for:", product);

        const res = await fetch(API + "/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: product.price,
                id: product._id
            })
        });

        const data = await res.json();

        console.log("🧾 ORDER RESPONSE:", data);

        // 🔥 SHOW REAL ERROR FROM BACKEND
        if (!res.ok) {
            alert("Backend Error: " + JSON.stringify(data));
            throw new Error("Order failed");
        }

        if (!data.payment_session_id) {
            alert("No payment session ID received");
            throw new Error("Invalid response");
        }

        // =========================
        // CASHFREE CHECKOUT
        // =========================
        const cashfree = Cashfree({
            mode: "sandbox"
        });

        cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
        });

    } catch (err) {
        console.error("❌ PAYMENT ERROR:", err);
        alert("Payment failed");
    }
}

// =========================
// INIT
// =========================
loadProduct();