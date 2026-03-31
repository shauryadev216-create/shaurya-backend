const API = "https://shaurya-backend.onrender.com";

async function loadPurchases(){

    const email = localStorage.getItem("userEmail");

if(!email){
    alert("Please login first");
    window.location.href = "/login.html";
    return;
}

    try{

        const res = await fetch(API + "/my-purchases/" + email);
        const purchases = await res.json();

        const res2 = await fetch(API + "/products");
        const products = await res2.json();

        const container = document.getElementById("purchaseList");
        container.innerHTML = "";

        purchases.forEach(p => {

            const product = products.find(prod => String(prod._id) === String(p.product_id));

            if(!product) return;

            container.innerHTML += `
            <div class="card">

                <img src="${product.cover}">

                <div>
                    <b>${product.title}</b><br>
                    $${product.price}
                </div>

                <button class="download-btn"
                onclick='downloadProduct(${JSON.stringify(product)})'>
                Download
                </button>

            </div>
            `;
        });

    }catch(err){
        console.error(err);
        alert("Error loading purchases");
    }
}

// ==========================
// DOWNLOAD
// ==========================
function downloadProduct(product){

    let fileUrl = "";

    if(product.type === "photo"){
        fileUrl = product.original;
    }
    else if(product.type === "pack"){
        fileUrl = product.zip;
    }

    if(!fileUrl){
        alert("File not available");
        return;
    }

    fetch(fileUrl)
    .then(res => res.blob())
    .then(blob => {

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;

        let ext = fileUrl.split(".").pop().split("?")[0];
        link.download = product.title + "." + ext;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
    });
}
document.addEventListener("DOMContentLoaded", loadPurchases);