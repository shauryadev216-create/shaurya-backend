const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function start(){

    console.log("ID:", id);

    if(!id){
        alert("No ID");
        return;
    }

    try{
        // 🔥 STEP 1: GET PRODUCT
        const res = await fetch(API + "/products");
        const products = await res.json();

        const cleanId = id.trim();

const product = products.find(p => {
    return p._id.includes(cleanId) || cleanId.includes(p._id);
});

        console.log("PRODUCT:", product);

        if(!product){
            alert("Product not found");
            return;
        }

        // 🔥 STEP 2: CREATE ORDER
        const orderRes = await fetch(API + "/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: product.price,
                id: product._id
            })
        });

        const data = await orderRes.json();

        console.log("ORDER:", data);

        if(!data.payment_session_id){
            alert("Payment failed");
            return;
        }

        // 🔥 STEP 3: CASHFREE
        const cashfree = Cashfree({
            mode: "sandbox"
        });

        cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
        });

    }catch(err){
        console.error(err);
        alert("Error");
    }
}

document.addEventListener("DOMContentLoaded", start);