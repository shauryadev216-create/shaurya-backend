const API = "https://shaurya-backend.onrender.com";

// =========================
// CLOUDINARY
// =========================
async function uploadToCloudinary(file){

    const url = "https://api.cloudinary.com/v1_1/dayaij4yc/image/upload";

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "unsigned_preset");

    const res = await fetch(url, { method:"POST", body:fd });
    const data = await res.json();

    if(data.secure_url) return data.secure_url;
    throw new Error("Upload failed");
}

async function uploadZip(file){

    const url = "https://api.cloudinary.com/v1_1/dayaij4yc/raw/upload";

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "unsigned_preset");

    const res = await fetch(url, { method:"POST", body:fd });
    const data = await res.json();

    if(data.secure_url) return data.secure_url;
    throw new Error("ZIP upload failed");
}

let editId = null;

// =========================
// ADD PRODUCT
// =========================
async function addProduct(){

    try{

        const title = document.getElementById("title").value.trim();
        const price = document.getElementById("price").value.trim();
        const description = document.getElementById("description").value.trim();
        const type = document.querySelector('input[name="type"]:checked').value;

        const category = [];
        document.querySelectorAll(".category-box input:checked").forEach(c=>{
            category.push(c.value);
        });

        if(!title || !price || !description){
            alert("Fill all fields!");
            return;
        }

        let product = {
            id: editId || Date.now().toString(), // 🔥 KEY FIX
            title,
            price: Number(price),
            description,
            category,
            type
        };

        // ================= FILE LOGIC (same as before) =================

        if(type === "photo"){

            const coverFile = document.getElementById("photoCover").files[0];
            const originalFile = document.getElementById("photoOriginal").files[0];
            const previewFiles = document.getElementById("packPreview").files;

            if(!coverFile || !originalFile){
                alert("Upload cover & HD image");
                return;
            }

            product.cover = await uploadToCloudinary(coverFile);
            product.original = await uploadToCloudinary(originalFile);

            let previewURLs = [];

            for(let file of previewFiles){
                previewURLs.push(await uploadToCloudinary(file));
            }

            product.preview = previewURLs.length ? previewURLs : [product.cover];
        }

        else{

            const previewFiles = document.getElementById("packPreview").files;
            const zipFile = document.getElementById("packZip").files[0];

            if(!zipFile){
                alert("Upload ZIP file");
                return;
            }

            let previewURLs = [];

            for(let file of previewFiles){
                previewURLs.push(await uploadToCloudinary(file));
            }

            product.preview = previewURLs;
            product.cover = previewURLs[0] || "";
            product.zip = await uploadZip(zipFile);
        }

        // =========================
        // 🔥 CREATE OR UPDATE LOGIC
        // =========================

        let url = API + "/add-product";
        let method = "POST";

        if(editId){
            url = API + "/update-product/" + editId;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(product)
        });

        const data = await res.json();

        if(data.success){
            alert("✅ Saved!");

            editId = null; // 🔥 RESET
            loadProducts();
        }else{
            alert("❌ Failed");
        }

    }catch(err){
        console.error(err);
        alert("❌ Error");
    }
}

// =========================
// LOAD
// =========================
async function loadProducts(){

    const res = await fetch(API + "/products");
    const products = await res.json();

    renderProducts(products);
}

// =========================
// DELETE
// =========================
async function deleteProduct(id){

    await fetch(API + "/delete-product/" + id, { method:"DELETE" });
    loadProducts();
}

// =========================
// RENDER
// =========================
function renderProducts(products){

    const box = document.getElementById("product-list-admin");
    box.innerHTML = "";

    products.forEach(p=>{
        box.innerHTML += `
        <div class="admin-card">
            <div>
                <b>${p.title}</b><br>
                $${p.price}<br>
                ${p.type}
            </div>

            <div>
                <button onclick='deleteProduct("${p.id}")'>Delete</button>
            </div>
        </div>`;
    });
}

// INIT
document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();
    document.getElementById("saveBtn").addEventListener("click", addProduct);
});