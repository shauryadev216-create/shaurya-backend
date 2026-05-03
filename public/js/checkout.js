const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

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

        // TITLE
        document.getElementById("title").textContent = product.title;

        // IMAGE
        document.getElementById("productImage").src = product.cover;

        // PRICE SYSTEM
        const price = Number(product.price);
        const original = Number(product.originalPrice || 0);

        const priceBox = document.getElementById("price");

        if(original && original > price){

            const discount = Math.round(((original - price)/original)*100);

            priceBox.innerHTML = `
                <div style="display:flex; gap:10px;">
                    <span style="color:red;">-${discount}%</span>
                    <span style="text-decoration:line-through;color:#888;">₹${original}</span>
                </div>
                <div style="font-size:22px;font-weight:600;">₹${price}</div>
            `;
        }else{
            priceBox.innerHTML = `<b>₹${price}</b>`;
        }

        // Quantity (default = 1)
        document.getElementById("qty").textContent = "1";

        // Total
        document.getElementById("total").textContent = "₹" + price;

    }catch(err){
        console.error(err);
    }
}

// ==========================
// PAYMENT
// ==========================
async function payNow(){

    try{

        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;

        if(!phone || !email){
            alert("Enter phone & email");
            return;
        }

        const btn = document.getElementById("payBtn");
        btn.innerText = "Processing...";
        btn.disabled = true;

        const res = await fetch(API + "/create-order", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({
                productId: id,
                phone,
                email
            })
        });

        const data = await res.json();

        if(!data.success){
            alert("Payment init failed ❌");
            btn.innerText = "Proceed to Payment";
            btn.disabled = false;
            return;
        }

        // 🔥 REDIRECT TO CASHFREE
        window.location.href = data.payment_link;

    }catch(err){
        console.error(err);
        alert("Something went wrong ❌");
    }
}

// INIT
document.addEventListener("DOMContentLoaded", loadProduct);