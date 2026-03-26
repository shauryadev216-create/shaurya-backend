let allImages = [];
let currentCategory = "all";

// =========================
// SAFE CATEGORY
// =========================
function safeCategory(cat){
    if(!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
}

// =========================
// LOAD FROM PRODUCTS
// =========================
function loadGallery(){

    const products = JSON.parse(localStorage.getItem("products")) || [];

    allImages = [];

    products.forEach(p=>{

        const categories = safeCategory(p.category);

        // PHOTO → only cover
        if(p.type === "photo"){
            allImages.push({
                src: p.cover,
                category: categories,
                productId: p.id
            });
        }

        // PACK → all preview images
        if(p.type === "pack" && p.preview){
            p.preview.forEach(img=>{
                allImages.push({
                    src: img,
                    category: categories,
                    productId: p.id
                });
            });
        }
    });

    renderGallery(allImages);
}

// =========================
// RENDER
// =========================
function renderGallery(list){

    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";

    if(list.length === 0){
        grid.innerHTML = "<p>No images found</p>";
        return;
    }

    list.forEach(img=>{

        const div = document.createElement("div");
        div.className = "gallery-item";

        div.innerHTML = `
            <img src="${img.src}" onclick="openProduct('${img.productId}')">
        `;

        grid.appendChild(div);
    });
}

// =========================
// OPEN PRODUCT
// =========================
function openProduct(id){
    window.location.href = `product-template.html?id=${id}`;
}

// =========================
// FILTER CATEGORY
// =========================
function filterCategory(cat){

    currentCategory = cat;

    if(cat === "all"){
        renderGallery(allImages);
        return;
    }

    const filtered = allImages.filter(img =>
        img.category.includes(cat)
    );

    renderGallery(filtered);
}

// =========================
// SEARCH
// =========================
document.getElementById("searchBox").addEventListener("input", function(){

    const q = this.value.toLowerCase();

    const filtered = allImages.filter(img =>
        img.category.join(" ").toLowerCase().includes(q)
    );

    renderGallery(filtered);
});

// INIT
document.addEventListener("DOMContentLoaded", loadGallery);