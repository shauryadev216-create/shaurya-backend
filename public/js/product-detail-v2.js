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

        // UI
        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;
        document.getElementById("mainImage").src = product.cover;

        // BUTTON DEFAULT
        const btn = document.getElementById("buyBtn");
        btn.onclick = () => {
            window.location.href = "payment.html?id=" + id;
        };

        // 🔥 IF RETURNED FROM PAYMENT
        if(orderId){
            verifyAndDownload();
        }

    }catch(err){
        console.error(err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

// =========================
// VERIFY + DOWNLOAD FLOW
// =========================
async function verifyAndDownload(){

    try{
        const res = await fetch(API + "/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId })
        });

        const data = await res.json();

        console.log("VERIFY:", data);

        if(!data.success){
            alert("Payment not verified yet");
            return;
        }

        // ✅ SUCCESS UI
        showDownloadUI();

        // 🔥 AUTO DOWNLOAD AFTER 5s
        let seconds = 5;
        const timer = setInterval(()=>{
            document.getElementById("countdown").textContent =
                "Downloading in " + seconds + "s...";
            seconds--;

            if(seconds < 0){
                clearInterval(timer);
                downloadFile();
            }
        },1000);

    }catch(err){
        console.error(err);
    }
}

// =========================
// DOWNLOAD UI
// =========================
function showDownloadUI(){

    const container = document.querySelector(".product-buy");

    container.innerHTML = `
        <p id="countdown">Preparing download...</p>
        <button id="downloadBtn" class="buy-btn">Download Now</button>
    `;

    document.getElementById("downloadBtn").onclick = downloadFile;
}

// =========================
// DOWNLOAD FUNCTION
// =========================
function downloadFile(){

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
    const name = (productData.title || "download")
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_");

    link.download = name + "." + ext;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// =========================
// INIT
// =========================
loadProduct();