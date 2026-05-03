
const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");
const phone = params.get("phone");
const email = params.get("email");

let productData = null;

async function loadProduct(){

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

    // PRICE DISPLAY (with discount)
    const price = Number(product.price);
    const original = Number(product.originalPrice || 0);

    if(original && original > price){
        const discount = Math.round(((original - price)/original)*100);

        document.getElementById("price").innerHTML = `
            <span style="text-decoration:line-through;color:#888;">₹${original}</span>
            <span style="color:red;margin-left:8px;">${discount}% OFF</span>
            <br>
            <b style="font-size:20px;">₹${price}</b>
        `;
    }else{
        document.getElementById("price").textContent = "₹" + price;
    }

    document.getElementById("phone").value = phone || "";
    document.getElementById("email").value = email || "";
}

function payNow(){

    const phoneVal = document.getElementById("phone").value;
    const emailVal = document.getElementById("email").value;

    if(!phoneVal || !emailVal){
        alert("Enter phone & email");
        return;
    }

    // 🔥 THIS IS WHAT CASHFREE EXPECTS
    window.location.href =
        `/payment.html?id=${id}&phone=${phoneVal}&email=${emailVal}`;
}

loadProduct();