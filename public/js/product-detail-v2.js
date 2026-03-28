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

        // 🔥 IF RETURNED FROM PAYMENT → VERIFY + AUTO DOWNLOAD
        if(orderId){
            await verifyAndDownload();
        }

    }catch(err){
        console.error(err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

// =========================
// VERIFY + AUTO DOWNLOAD
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

        console.log("VERIFY RESULT:", data);

        if(data.success){

            alert("✅ Payment Successful! Download starting...");

            // 🔥 SAVE PURCHASE
            localStorage.setItem("purchased_" + id, "true");

            // 🔥 CLEAN URL
            window.history.replaceState({}, document.title, "product-template.html?id=" + id);

            // 🔥 AUTO DOWNLOAD
            downloadProduct();

        }else{
            alert("❌ Payment verification failed");
        }

    }catch(err){
        console.error("Verify error:", err);
        alert("Error verifying payment");
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