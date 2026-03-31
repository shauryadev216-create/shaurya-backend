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
    throw new Error("Image upload failed");
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
// 🔥 MODE SWITCH UI
// =========================
function updateModeUI(){

    const type = document.querySelector('input[name="type"]:checked').value;

    const photoCover = document.getElementById("photoCover");
    const photoOriginal = document.getElementById("photoOriginal");
    const packPreview = document.getElementById("packPreview");
    const packZip = document.getElementById("packZip");

    if(type === "photo"){

        photoCover.disabled = false;
        photoOriginal.disabled = false;

        packPreview.disabled = false; // optional preview allowed
        packZip.disabled = true;

        packZip.parentElement.style.opacity = 0.3;

    }else{

        photoCover.disabled = true;
        photoOriginal.disabled = true;

        packPreview.disabled = false;
        packZip.disabled = false;

        packZip.parentElement.style.opacity = 1;
    }
}

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

            const coverURL = await uploadToCloudinary(coverFile);
            const originalURL = await uploadToCloudinary(originalFile);

            let previewURLs = [];

            if(previewFiles.length){
                for(let file of previewFiles){
                    previewURLs.push(await uploadToCloudinary(file));
                }
            }

            product.cover = coverURL;
            product.original = originalURL;
            product.preview = previewURLs.length ? previewURLs : [coverURL];
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

            for(let file of previewFiles){
                previewURLs.push(await uploadToCloudinary(file));
            }

            const zipURL = await uploadZip(zipFile);

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

    editId = p.id;
    updateModeUI();
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
                <button class="action-btn edit-btn"
                onclick='editProduct(${JSON.stringify(p)})'>Edit</button>

                <button class="action-btn delete-btn"
                onclick='deleteProduct("${p.id}")'>Delete</button>
            </div>
        </div>`;
    });
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", ()=>{

    loadProducts();
    updateModeUI();

    document.getElementById("saveBtn").addEventListener("click", addProduct);

    document.querySelectorAll('input[name="type"]').forEach(r=>{
        r.addEventListener("change", updateModeUI);
    });
});