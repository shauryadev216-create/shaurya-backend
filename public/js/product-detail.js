const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("URL ID:", id);

async function loadProduct(){

    try{
        const res = await fetch(API + "/products");
        const products = await res.json();

        console.log("ALL PRODUCTS:", products);

        const product = products.find(p => String(p._id) === String(id));

        console.log("FOUND:", product);

        if(!product){
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        // ✅ SAFE DOM SET (NO CRASH)
        const title = document.getElementById("title");
        const desc = document.getElementById("description");
        const price = document.getElementById("price");
        const img = document.getElementById("mainImage");
        const btn = document.getElementById("buyBtn");

        if(title) title.textContent = product.title;
        if(desc) desc.textContent = product.description || "";
        if(price) price.textContent = "$" + product.price;

        if(img){
            img.src = product.cover || "https://via.placeholder.com/400";
        }

        if(btn){
            btn.onclick = () => {
                window.location.href = "payment.html?id=" + product._id;
            };
        }

    }catch(err){
        console.error("ERROR:", err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

loadProduct();