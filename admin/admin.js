const API = "https://shaurya-backend.onrender.com";

// =========================
// CLOUDINARY
// =========================
async function uploadToCloudinary(file){

    const url = "https://api.cloudinary.com/v1_1/dayaij4yc/auto/upload";

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "unsigned_preset");

    try{
        const res = await fetch(url, {
            method:"POST",
            body:fd
        });

        const data = await res.json();

        if(data.secure_url) return data.secure_url;

        console.error("Cloudinary error:", data);
        throw new Error("Upload failed");

    }catch(err){
        console.error("UPLOAD ERROR:", err);
        throw err;
    }
}
async function uploadZip(file){

    const url = "https://api.cloudinary.com/v1_1/dayaij4yc/auto/upload";

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
// ADD / UPDATE PRODUCT
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
            id: editId || Date.now().toString(),
            title,
            price: Number(price),
            description,
            category,
            type
        };

        // ================= PHOTO =================
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

            if(previewFiles && previewFiles.length){
                for(let file of previewFiles){
                    try{
                        const url = await uploadToCloudinary(file);
                        previewURLs.push(url);
                    }catch(e){
                        console.error("Preview upload failed:", e);
                    }
                }
            }

            product.preview = previewURLs.length ? previewURLs : [product.cover];
        }

        // ================= PACK =================
        else{

            const previewFiles = document.getElementById("packPreview").files;
            const zipFile = document.getElementById("packZip").files[0];

            if(!zipFile){
                alert("Upload ZIP file");
                return;
            }

            let previewURLs = [];

            if(previewFiles && previewFiles.length){
                for(let file of previewFiles){
                    try{
                        const url = await uploadToCloudinary(file);
                        previewURLs.push(url);
                    }catch(e){
                        console.error("Preview upload failed:", e);
                    }
                }
            }

            // 🔥 ZIP UPLOAD (WITH DEBUG)
            let zipURL = "";
            try{
                zipURL = await uploadToCloudinary(zipFile);
            }catch(err){
                console.error("ZIP upload failed:", err);
                alert("ZIP upload failed ❌");
                return;
            }

            product.preview = previewURLs;
            product.cover = previewURLs[0] || "";
            product.zip = zipURL;
        }

        // ================= SEND =================
        const res = await fetch(API + "/add-product", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(product)
        });

        const data = await res.json();

        if(data.success){
            alert("✅ Saved!");
            editId = null;
            loadProducts();
        }else{
            console.error(data);
            alert("❌ Failed");
        }

    }catch(err){
        console.error("FULL ERROR:", err);
        alert("Something broke — check console ❌");
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
// EDIT
// =========================
function editProduct(p){

    document.getElementById("title").value = p.title;
    document.getElementById("price").value = p.price;
    document.getElementById("description").value = p.description;

    document.querySelector(`input[value="${p.type}"]`).checked = true;

    document.querySelectorAll(".category-box input").forEach(c=>{
        c.checked = p.category?.includes(c.value);
    });

    editId = p.id || p._id;

    document.getElementById("saveBtn").textContent = "Update Product";
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

            <div style="display:flex; gap:10px;">

                <button class="action-btn edit-btn"
                onclick='editProduct(${JSON.stringify(p)})'>
                Edit
                </button>

                <button class="action-btn delete-btn"
                onclick='deleteProduct("${p.id || p._id}")'>
                Delete
                </button>

            </div>

        </div>
        `;
    });
}

// INIT
document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();
    document.getElementById("saveBtn").addEventListener("click", addProduct);
});