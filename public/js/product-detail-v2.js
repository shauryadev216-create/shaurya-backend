console.log("JS LOADED 🚀");

const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const orderId = params.get("order_id");

let productData = null;

// LOAD PRODUCT
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

        document.getElementById("title").textContent = product.title;
        document.getElementById("description").textContent = product.description || "";
        document.getElementById("price").textContent = "$" + product.price;
        document.getElementById("mainImage").src = product.cover;

        // 🔥 IF RETURNED FROM PAYMENT
        if(orderId){
            await verifyPayment();
        }

        updateButton();

    }catch(err){
        console.error(err);
        document.body.innerHTML = "<h1>Error loading product</h1>";
    }
}

// VERIFY PAYMENT
async function verifyPayment(){
    try{
        const res = await fetch(API + "/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId })
        });

        const data = await res.json();

        if(data.success){
            localStorage.setItem("purchased_" + id, "true");

            // CLEAN URL
            window.history.replaceState({}, document.title, "product-template.html?id=" + id);

            startAutoDownload();
        }

    }catch(err){
        console.error(err);
    }
}

// BUTTON LOGIC
function updateButton(){
    const btn = document.getElementById("buyBtn");

    if(localStorage.getItem("purchased_" + id) === "true"){
        btn.textContent = "Download Again";
        btn.onclick = downloadProduct;
    }else{
        btn.textContent = "Buy Now";
        btn.onclick = () => {
            window.location.href = "payment.html?id=" + id;
        };
    }
}

// AUTO DOWNLOAD WITH COUNTDOWN
function startAutoDownload(){
    const btn = document.getElementById("buyBtn");

    let seconds = 5;
    btn.textContent = "Downloading in 5...";

    const interval = setInterval(()=>{
        seconds--;
        btn.textContent = "Downloading in " + seconds + "...";

        if(seconds <= 0){
            clearInterval(interval);
            downloadProduct();
            updateButton();
        }
    },1000);
}

// DOWNLOAD
function downloadProduct(){
    if(!productData) return;

    let fileUrl = productData.type === "photo"
        ? (productData.original || productData.cover)
        : productData.zip;

    const link = document.createElement("a");
    link.href = fileUrl;

    const ext = fileUrl.split(".").pop();
    const cleanName = productData.title.replace(/[^\w\s]/gi,"").replace(/\s+/g,"_");

    link.download = cleanName + "." + ext;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// INIT
loadProduct();