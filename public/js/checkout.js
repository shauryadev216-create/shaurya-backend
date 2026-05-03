const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");
const phone = params.get("phone");
const email = params.get("email");

let productData = null;

// ==========================
// LOAD PRODUCT
// ==========================
async function loadProduct(){

    try{

        const res = await fetch(API + "/products");
        const products = await res.json();

        const product = products.find(p => String(p._id) === String(id));

        if(!product){
            document.body.innerHTML = "Product not found";
            return;
        }

        productData = product;

        document.getElementById("title").textContent = product.title;
        document.getElementById("productImage").src = product.cover;

        // PRICE DISPLAY
        const price = Number(product.price);
        const original = Number(product.originalPrice || 0);

        if(original && original > price){
            const discount = Math.round(((original - price)/original)*100);

            document.getElementById("price").innerHTML = `
                <span style="text-decoration:line-through;color:#888;">₹${original}</span>
                <span style="color:red;margin-left:8px;">-${discount}%</span>
                <br>
                <b style="font-size:22px;">₹${price}</b>
            `;
        }else{
            document.getElementById("price").innerHTML =
                `<b style="font-size:22px;">₹${price}</b>`;
        }

        document.getElementById("phone").value = phone || "";
        document.getElementById("email").value = email || "";

    }catch(err){
        console.error("LOAD ERROR:", err);
        alert("Failed to load product ❌");
    }
}

// ==========================
// PAY NOW (🔥 FINAL FIX)
// ==========================
async function payNow(){

    try{

        if(!productData){
            alert("Product not loaded ❌");
            return;
        }

        const phoneVal = document.getElementById("phone").value;
        const emailVal = document.getElementById("email").value;

        if(!phoneVal || !emailVal){
            alert("Enter phone & email");
            return;
        }

        const btn = document.querySelector(".pay-btn");
        btn.innerText = "Processing...";
        btn.disabled = true;

        // ==========================
        // CALL BACKEND
        // ==========================
        const res = await fetch(API + "/create-order", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({
                amount: productData.price,
                id: productData._id,
                phone: phoneVal,
                email: emailVal
            })
        });

        const data = await res.json();

        console.log("BACKEND RESPONSE:", data);

        if(!data.payment_session_id){
            alert("Payment init failed ❌\nCheck console");
            btn.innerText = "Proceed to Payment";
            btn.disabled = false;
            return;
        }

        // ==========================
        // CASHFREE SDK
        // ==========================
        const cashfree = Cashfree({
            mode: "sandbox" // change to "production" later
        });

        cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
        });

    }catch(err){
        console.error("PAY ERROR:", err);
        alert("Something went wrong ❌");
    }
}

// ==========================
loadProduct();