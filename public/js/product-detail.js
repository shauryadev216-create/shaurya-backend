const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadProduct(){

    try{
        const res = await fetch(API + "/products");
        const products = await res.json();

        const product = products.find(p => String(p._id) === String(id));

        if(!product){
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        // SET DATA
        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;

        document.getElementById("mainImage").src =
            product.cover || "https://via.placeholder.com/400";

        // BUY BUTTON
        document.getElementById("buyBtn").onclick = () => {
            window.location.href = "payment.html?id=" + product._id;
        };

    }catch(err){
        console.error(err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

loadProduct();