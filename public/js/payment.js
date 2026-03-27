// =========================
// CONFIG
// =========================
const API = "https://shaurya-backend.onrender.com";

// =========================
// GET URL PARAM
// =========================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// =========================
// LOAD PRODUCT FROM SERVER
// =========================
async function loadProduct(){

    try{

        const res = await fetch(API + "/products");
        const products = await res.json();

        console.log("All products:", products);
        console.log("URL ID:", id);

        const product = products.find(p => {
            const mongoId = String(p._id);
            const customId = String(p.id);
            const urlId = String(id);

            return mongoId === urlId || customId === urlId;
        });

        console.log("Found product:", product);

        if(!product){
            alert("Product not found");
            throw new Error("No product");
        }

        startPayment(product);

    }catch(err){
        console.error("LOAD ERROR:", err);
        alert("Error loading product");
    }
}

// =========================
// CREATE ORDER + PAYMENT
// =========================
async function startPayment(product){

    try{

        const finalId = product._id || product.id;

        const res = await fetch(API + "/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: product.price,
                id: finalId
            })
        });

        const data = await res.json();

        console.log("Order response:", data);

        if(!data.payment_session_id){
            alert("Payment session failed");
            return;
        }

        const cashfree = Cashfree({
            mode: "sandbox"
        });

        cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
        });

    }catch(err){
        console.error("PAYMENT ERROR:", err);
        alert("Payment error");
    }
}

// =========================
// INIT
// =========================
loadProduct();