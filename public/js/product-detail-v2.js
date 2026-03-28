const API = "https://shaurya-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const orderId = params.get("order_id");

    let productData = null;

    console.log("JS LOADED");

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

            document.getElementById("title").textContent = product.title;
            document.getElementById("description").textContent = product.description || "";
            document.getElementById("price").textContent = "$" + product.price;
            document.getElementById("mainImage").src = product.cover;

            const btn = document.getElementById("buyBtn");

            console.log("BUTTON FOUND:", btn);

            // 🔥 FORCE CLICK HANDLER (NO CONDITION)
            btn.addEventListener("click", () => {
                console.log("BUTTON CLICKED 🔥");
                window.location.href = "payment.html?id=" + id;
            });

            // =========================
            // VERIFY PAYMENT (AUTO)
            // =========================
            if(orderId){
                await verifyAndDownload();
            }

        }catch(err){
            console.error(err);
        }
    }

    // =========================
    // VERIFY + DOWNLOAD
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
                alert("Payment success!");
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
            alert("No file");
            return;
        }

        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = productData.title + "." + fileUrl.split(".").pop();

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    loadProduct();
});