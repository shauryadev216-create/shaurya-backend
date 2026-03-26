const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// 🔥 MARK PURCHASE BEFORE PAYMENT (TEMP FIX)
localStorage.setItem("pending_payment_" + id, "true");

// GET PRODUCT
const products = JSON.parse(localStorage.getItem("products")) || [];
const product = products.find(p => String(p.id) === String(id));

if(!product){
    alert("Product not found");
    throw new Error("No product");
}

// =========================
// CREATE ORDER FROM BACKEND
// =========================
fetch("http://localhost:3000/create-order", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        amount: product.price,
        id: id
    })
})
.then(res => res.json())
.then(data => {

    const paymentSessionId = data.payment_session_id;

    const cashfree = new Cashfree({
        mode: "sandbox"
    });

    cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self"
    });

})
.catch(err => {
    console.error(err);
    alert("Payment error");
});