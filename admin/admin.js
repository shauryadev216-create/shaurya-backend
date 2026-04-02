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

// ================= DISCOUNT PREVIEW =================
function updateDiscount(){
    const original = parseFloat(document.getElementById("originalPrice").value);
    const price = parseFloat(document.getElementById("price").value);

    const box = document.getElementById("discountPreview");

    if(original && price && original > price){
        const percent = Math.round(((original - price)/original)*100);
        box.innerHTML = `🔥 ${percent}% OFF`;
    }else{
        box.innerHTML = "";
    }
}

// ================= ADD PRODUCT =================
async function addProduct(){

    try{

        const title = document.getElementById("title").value.trim();
        const price = document.getElementById("price").value.trim();
        const originalPrice = document.getElementById("originalPrice").value.trim();
        const rawDescription = document.getElementById("description").value;

        const description = formatDescription(rawDescription);

        const type = document.querySelector('input[name="type"]:checked').value;

        const category = [];
        document.querySelectorAll(".category-box input:checked").forEach(c=>{
            category.push(c.value);
        });

        let product = {
            id: editId || Date.now().toString(),
            title,
            price: Number(price),
            originalPrice: Number(originalPrice) || 0,
            description,
            category,
            type
        };

        if(type === "photo"){
            const cover = document.getElementById("photoCover").files[0];
            const original = document.getElementById("photoOriginal").files[0];

            product.cover = await uploadToCloudinary(cover);
            product.original = await uploadToCloudinary(original);
            product.preview = [product.cover];
        }

        else{
            const previewFiles = document.getElementById("packPreview").files;
            const zipFile = document.getElementById("packZip").files[0];

            let previews = [];

            for(let file of previewFiles){
                previews.push(await uploadToCloudinary(file));
            }

            product.preview = previews;
            product.cover = previews[0] || "";
            product.zip = await uploadToCloudinary(zipFile);
        }

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
        }

    }catch(err){
        console.error(err);
        alert("Error ❌");
    }
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

// ================= EDIT =================
function editProduct(p){

    document.getElementById("title").value = p.title;
    document.getElementById("price").value = p.price;
    document.getElementById("originalPrice").value = p.originalPrice || "";

    document.getElementById("description").value =
        (p.description || "").replace(/<br><br>/g,"\n");

    editId = p.id || p._id;

    document.getElementById("saveBtn").textContent = "Update Product";

    updateDiscount();
}

// ================= RENDER =================
function renderProducts(products){

    const box = document.getElementById("product-list-admin");
    box.innerHTML = "";

    products.forEach(p=>{

        let discountHTML = "";

        if(p.originalPrice && p.originalPrice > p.price){
            const percent = Math.round(((p.originalPrice - p.price)/p.originalPrice)*100);
            discountHTML = ` (${percent}% OFF)`;
        }

        box.innerHTML += `
        <div class="admin-card">
            <div>
                <b>${p.title}</b><br>
                ${p.originalPrice ? `<s>$${p.originalPrice}</s>` : ""}
                ₹${p.price}
                ${discountHTML}
            </div>

            <div style="display:flex; gap:10px;">
                <button class="action-btn edit-btn"
                onclick='editProduct(${JSON.stringify(p)})'>Edit</button>

                <button class="action-btn delete-btn"
                onclick='deleteProduct("${p.id || p._id}")'>Delete</button>
            </div>
        </div>`;
    });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();

    document.getElementById("saveBtn").addEventListener("click", addProduct);

    document.getElementById("originalPrice").addEventListener("input", updateDiscount);
    document.getElementById("price").addEventListener("input", updateDiscount);
});