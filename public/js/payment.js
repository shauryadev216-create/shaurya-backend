const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");
const phone = params.get("phone");
const email = params.get("email");

if (!id) {
    alert("Missing product ID");
    throw new Error("No ID");
}

async function loadProduct() {

    const res = await fetch(API + "/products");
    const products = await res.json();

    const product = products.find(p => String(p._id) === String(id));

    if (!product) {
        alert("Product not found");
        return;
    }

    startPayment(product);
}

async function startPayment(product) {

    try {

        const res = await fetch(API + "/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: product.price,
                id: product._id,
                phone,
                email
            })
        });

        const data = await res.json();

        if (!data.payment_session_id) {
            alert("Payment session error");
            return;
        }

        const cashfree = Cashfree({
            mode: "sandbox"
        });

        cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
        });

    } catch (err) {
        console.error(err);
        alert("Payment failed");
    }
}

loadProduct();