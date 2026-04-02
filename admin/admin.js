const API = "https://shaurya-backend.onrender.com";

let editId = null;

// ================= CLOUDINARY =================
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

// ================= DESCRIPTION =================
function formatDescription(text){
    return text.replace(/\r?\n/g, "<br><br>");
}

// ================= ADD / UPDATE =================
async function addProduct(){

    try{

        const title = document.getElementById("title").value.trim();
        const price = parseFloat(document.getElementById("price").value);
        const originalPrice = parseFloat(document.getElementById("originalPrice").value);
        const rawDescription = document.getElementById("description").value;

        const description = formatDescription(rawDescription);

        const type = document.querySelector('input[name="type"]:checked').value;

        const category = [];
        document.querySelectorAll(".category-box input:checked").forEach(c=>{
            category.push(c.value);
        });

        // 🔥 CALCULATE DISCOUNT
        let discount = 0;
        if(originalPrice && price && originalPrice > price){
            discount = Math.round(((originalPrice - price)/originalPrice)*100);
        }

        let product = {
            id: editId || Date.now().toString(),
            title,
            price,
            originalPrice: originalPrice || 0,
            discount,
            description,
            category,
            type
        };

        // FILES
        if(type === "photo"){
            const cover = document.getElementById("photoCover").files[0];
            const original = document.getElementById("photoOriginal").files[0];

            if(cover) product.cover = await uploadToCloudinary(cover);
            if(original) product.original = await uploadToCloudinary(original);

        } else {

            const previewFiles = document.getElementById("packPreview").files;
            const zipFile = document.getElementById("packZip").files[0];

            if(previewFiles.length){
                let previews = [];
                for(let file of previewFiles){
                    previews.push(await uploadToCloudinary(file));
                }
                product.preview = previews;
                product.cover = previews[0];
            }

            if(zipFile){
                product.zip = await uploadToCloudinary(zipFile);
            }
        }

        // 🔥 UPDATE OR CREATE
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
        }

    }catch(err){
        console.error(err);
        alert("Error ❌");
    }
}

// ================= EDIT =================
function editProduct(p){

    document.getElementById("title").value = p.title;
    document.getElementById("price").value = p.price;
    document.getElementById("originalPrice").value = p.originalPrice || "";

    document.getElementById("description").value =
        (p.description || "").replace(/<br><br>/g,"\n");

    document.querySelector(`input[value="${p.type}"]`).checked = true;

    document.querySelectorAll(".category-box input").forEach(c=>{
        c.checked = p.category?.includes(c.value);
    });

    editId = p.id || p._id;
    document.getElementById("saveBtn").textContent = "Update Product";
}

// ================= LOAD =================
async function loadProducts(){
    const res = await fetch(API + "/products");
    const products = await res.json();
    renderProducts(products);
}

// ================= DELETE =================
async function deleteProduct(id){
    await fetch(API + "/delete-product/" + id, { method:"DELETE" });
    loadProducts();
}

// ================= RENDER =================
function renderProducts(products){

    const box = document.getElementById("product-list-admin");
    box.innerHTML = "";

    products.forEach(p=>{

        box.innerHTML += `
        <div class="admin-card">
            <div>
                <b>${p.title}</b><br>

                ${p.discount ? `<span style="color:red">-${p.discount}%</span>` : ""}

                ${p.originalPrice ? `<s>₹${p.originalPrice}</s>` : ""}

                <b>₹${p.price}</b>
            </div>

            <div style="display:flex; gap:10px;">
                <button onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
                <button onclick='deleteProduct("${p.id || p._id}")'>Delete</button>
            </div>
        </div>`;
    });
}

// INIT
document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();
    document.getElementById("saveBtn").addEventListener("click", addProduct);
});