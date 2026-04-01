const API = "https://shaurya-backend.onrender.com";

// =========================
// CLOUDINARY
// =========================
async function uploadToCloudinary(file){

    const url = "https://api.cloudinary.com/v1_1/dayaij4yc/auto/upload";

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "unsigned_preset");

    const res = await fetch(url, { method:"POST", body:fd });
    const data = await res.json();

    if(data.secure_url) return data.secure_url;
    throw new Error("Upload failed");
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

            const coverFiles = document.getElementById("photoCover").files;
            const originalFile = document.getElementById("photoOriginal").files[0];

            if(!coverFiles.length || !originalFile){
                alert("Upload cover & HD image");
                return;
            }

            // 🔥 MULTIPLE PREVIEW IMAGES
            let previewURLs = [];

            for(let file of coverFiles){
                const url = await uploadToCloudinary(file);
                previewURLs.push(url);
            }

            // 🔥 MAIN COVER = FIRST IMAGE
            product.cover = previewURLs[0];

            // 🔥 ALL IMAGES = PREVIEW
            product.preview = previewURLs;

            // 🔥 ORIGINAL HD
            product.original = await uploadToCloudinary(originalFile);
        }

        // ================= PACK =================
        else{

            const previewFiles = document.getElementById("packPreview").files;
            const zipFile = document.getElementById("packZip").files[0];

            if(!previewFiles.length || !zipFile){
                alert("Upload preview images & ZIP");
                return;
            }

            let previewURLs = [];

            for(let file of previewFiles){
                const url = await uploadToCloudinary(file);
                previewURLs.push(url);
            }

            product.preview = previewURLs;
            product.cover = previewURLs[0];
            product.zip = await uploadZip(zipFile);
        }

        // =========================
        // CREATE OR UPDATE
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

            editId = null;
            document.getElementById("saveBtn").textContent = "Save Product";

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