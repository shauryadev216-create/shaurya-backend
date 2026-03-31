const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let productData = null;

// =========================
// LOAD PRODUCT
// =========================
async function loadProduct(){
    try{
        const res = await fetch(API + "/products");

        if(!res.ok){
            throw new Error("API failed");
        }

        const products = await res.json();

        console.log("ALL PRODUCTS:", products);
        console.log("URL ID:", id);

        const product = products.find(p => String(p._id) === String(id));

        if(!product){
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        productData = product;

        // ✅ SET DATA (NO MORE LOADING TEXT)
        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "No description";
        document.getElementById("price").textContent = "$" + product.price;
        document.getElementById("mainImage").src = product.cover;

        setupButton();

    }catch(err){
        console.error("LOAD ERROR:", err);

        // ❌ REMOVE FULL PAGE BREAK
        document.getElementById("title").textContent = "Error loading product";
    }
}

// =========================
// BUTTON
// =========================
function setupButton(){
    const btn = document.getElementById("buyBtn");

    btn.onclick = () => {
        window.location.href = "payment.html?id=" + id;
    };
}

// =========================
// INIT
// =========================
loadProduct();