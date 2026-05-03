const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const orderId = params.get("order_id");

let productData = null;

// ==========================
// SAFE DESCRIPTION
// ==========================
function renderDescription(text){
    if(!text) return "";
    return text
        .replace(/\n/g, "<br>")
        .replace(/<br><br>/g, "<br><br>");
}

// ==========================
// LOAD PRODUCT
// ==========================
async function loadProduct() {

    const res = await fetch(API + "/products");
    const products = await res.json();

    const product = products.find(p => String(p._id) === String(id));

    if (!product) {
        document.body.innerHTML = "<h1>Product Not Found</h1>";
        return;
    }

    productData = product;

    // TITLE
    document.getElementById("title").textContent = product.title;

    // ✅ DESCRIPTION FIX
    document.getElementById("description").innerHTML =
        renderDescription(product.description);

    // ================= PRICE SYSTEM =================
    const priceBox = document.getElementById("price");

    const price = Number(product.price);
    const original = Number(product.originalPrice || 0);

    if(original && original > price){

        const discount = Math.round(((original - price) / original) * 100);

        priceBox.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
                <span style="color:#ff4d4d; font-weight:600;">
                    -${discount}%
                </span>

                <span style="text-decoration:line-through; color:#888;">
                    ₹${original}
                </span>
            </div>

            <div style="font-size:28px; font-weight:700;">
                ₹${price}
            </div>
        `;
    }else{
        priceBox.innerHTML = `<b style="font-size:28px;">₹${price}</b>`;
    }

    // IMAGE
    document.getElementById("mainImage").src = product.cover;

    // ================= PREVIEW FIX =================
    const previewRow = document.getElementById("previewRow");

    if (previewRow && product.preview && product.preview.length){

        previewRow.innerHTML = "";

        product.preview.forEach(img=>{
            const el = document.createElement("img");
            el.src = img;
            el.onclick = ()=> changeImage(img);
            previewRow.appendChild(el);
        });
    }

    if (orderId){
        verifyPaymentAndDownload();
    }
}

// ==========================
function changeImage(src){
    document.getElementById("mainImage").src = src;
}

// ==========================
async function verifyPaymentAndDownload(){

    const res = await fetch(API + "/verify-payment", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ order_id: orderId })
    });

    const data = await res.json();

    if(!data.success){
        alert("Payment failed ❌");
        return;
    }

    showDownloadUI();
}

// ==========================
function showDownloadUI(){

    const btn = document.getElementById("buyBtn");

    btn.textContent = "Download Now";
    btn.onclick = startDownload;
}

// ==========================
function startDownload(){

    let fileUrl = productData.type === "photo"
        ? productData.original
        : productData.zip;

    fetch(fileUrl)
        .then(res => res.blob())
        .then(blob => {

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = productData.title;

            document.body.appendChild(a);
            a.click();
            a.remove();
        });
}

// ==========================
document.addEventListener("DOMContentLoaded", ()=>{

    document.getElementById("buyBtn").onclick = ()=>{

        const phone = document.getElementById("userPhone").value;
        const email = document.getElementById("userEmail").value;

        if(!phone || !email){
            alert("Enter details");
            return;
        }

        window.location.href =
            `/checkout.html?id=${id}&phone=${phone}&email=${email}`;
    };

    loadProduct();
});