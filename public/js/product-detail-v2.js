const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const orderId = params.get("order_id");

let productData = null;

// =========================
// LOAD PRODUCT
// =========================
async function loadProduct(){
    try{
        const res = await fetch(API + "/products");
        const products = await res.json();

        const product = products.find(p => String(p._id) === String(id));

        if(!product){
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        productData = product;

        // UI SET
        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;
        document.getElementById("mainImage").src = product.cover;

        const btn = document.getElementById("buyBtn");

        console.log("BUTTON:", btn);

        // 🔥 PAYMENT RETURN FLOW
        if(orderId){
            await verifyAndDownload();
        }

        // 🔥 BUTTON LOGIC (THIS WAS MISSING)
        const purchased = localStorage.getItem("purchased_" + id);

        if(purchased === "true"){
            btn.textContent = "Download";
            btn.onclick = downloadProduct;
        }else{
            btn.textContent = "Buy Now";
            btn.onclick = () => {
                console.log("CLICK WORKING");
                window.location.href = "payment.html?id=" + id;
            };
        }

    }catch(err){
        console.error(err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

// =========================
// VERIFY PAYMENT
// =========================
async function verifyAndDownload(){

    try{
        const res = await fetch(API + "/verify-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                order_id: orderId
            })
        });

        const data = await res.json();

        console.log("VERIFY:", data);

        if(data.success){

            localStorage.setItem("purchased_" + id, "true");

            alert("Payment successful! Download starting...");

            window.history.replaceState({}, document.title, "product-template.html?id=" + id);

            downloadProduct();
        }

    }catch(err){
        console.error(err);
    }
}

// =========================
// DOWNLOAD
// =========================
function downloadProduct(){

    if(!productData) return;

    let fileUrl = productData.type === "photo"
        ? (productData.original || productData.cover)
        : productData.zip;

    if(!fileUrl){
        alert("No file found");
        return;
    }

    const link = document.createElement("a");
    link.href = fileUrl;

    const ext = fileUrl.split(".").pop();
    const name = productData.title.replace(/\s+/g, "_");

    link.download = name + "." + ext;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// =========================
// INIT
// =========================
loadProduct();