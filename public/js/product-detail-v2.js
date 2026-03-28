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

        const title = document.getElementById("title");
        const desc = document.getElementById("description");
        const price = document.getElementById("price");
        const img = document.getElementById("mainImage");
        const btn = document.getElementById("buyBtn");

        // SET DATA
        if(title) title.textContent = product.title;
        if(desc) desc.textContent = product.description || "";
        if(price) price.textContent = "$" + product.price;
        if(img) img.src = product.cover;

        // 🔥 VERIFY PAYMENT FIRST
        await verifyPayment();

        // 🔥 THEN UPDATE BUTTON
        updateButton(btn);

    }catch(err){
        console.error(err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

// =========================
// VERIFY PAYMENT
// =========================
async function verifyPayment(){

    if(!orderId) return;

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

        console.log("VERIFY RESULT:", data);

        if(data.success){
            // ✅ MARK AS PURCHASED
            localStorage.setItem("purchased_" + id, "true");

            // 🔥 REMOVE order_id FROM URL (VERY IMPORTANT)
            window.history.replaceState(
                {},
                document.title,
                "product-template.html?id=" + id
            );
        }

    }catch(err){
        console.error("Verify error:", err);
    }
}

// =========================
// BUTTON LOGIC
// =========================
function updateButton(btn){

    const purchased = localStorage.getItem("purchased_" + id);

    if(purchased === "true"){
        btn.textContent = "Download";
        btn.onclick = downloadProduct;
    }else{
        btn.textContent = "Buy Now";
        btn.onclick = () => {
            window.location.href = "payment.html?id=" + id;
        };
    }
}

// =========================
// DOWNLOAD FUNCTION
// =========================
function downloadProduct(){

    if(!productData) return;

    let fileUrl = productData.type === "photo"
        ? (productData.original || productData.cover)
        : productData.zip;

    if(!fileUrl){
        alert("No file available");
        return;
    }

    const link = document.createElement("a");
    link.href = fileUrl;

    // 🔥 CLEAN FILE NAME
    const ext = fileUrl.split(".").pop();
    const cleanName = (productData.title || "download")
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_");

    link.download = cleanName + "." + ext;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// =========================
// INIT
// =========================
loadProduct();