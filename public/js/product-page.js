const API = "https://shaurya-backend.onrender.com";

let allProducts = [];
let currentFilter = "all";

function safeCategory(cat){
    if(!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
}

// =========================
// LOAD PRODUCTS
// =========================
async function loadProducts(){
    try{
        const res = await fetch(API + "/products");
        const data = await res.json();

        console.log("SHOP PRODUCTS:", data);

        allProducts = data;
        applyFilters();

    }catch(err){
        console.error(err);
    }
}

// =========================
// RENDER PRODUCTS
// =========================
function renderProducts(list){

    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if(list.length === 0){
        container.innerHTML = "<p>No products</p>";
        return;
    }

    list.forEach(p=>{

        // 🔥 MULTIPLE IMAGES
        let imagesHTML = "";

        if(p.preview && p.preview.length){

            p.preview.forEach(img => {
                imagesHTML += `
                    <img src="${img}" 
                    onclick="openProduct('${p._id}')"
                    style="cursor:pointer;">
                `;
            });

        } else {
            imagesHTML = `<img src="${p.cover}">`;
        }

        const div = document.createElement("div");
        div.className = "shop-card";

        div.innerHTML = `
            <div class="shop-image">
                ${imagesHTML}
            </div>

            <div class="shop-content">
                <h3>${p.title}</h3>
                <p>$${p.price}</p>

                <a class="view-pack-btn"
                href="product-template.html?id=${p._id}">
                View Product
                </a>
            </div>
        `;

        container.appendChild(div);
    });
}

// =========================
// FILTERS
// =========================
function applyFilters(){

    let filtered = [...allProducts];

    const search = document.getElementById("searchBox");
    const query = search ? search.value.toLowerCase() : "";

    if(query){
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query)
        );
    }

    if(currentFilter !== "all"){
        filtered = filtered.filter(p =>
            safeCategory(p.category).includes(currentFilter)
        );
    }

    renderProducts(filtered);
}

function filterCategory(cat){
    currentFilter = cat;
    applyFilters();
}

// =========================
// OPEN PRODUCT
// =========================
function openProduct(id){
    window.location.href = `/product-template.html?id=${id}`;
}

// INIT
document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();

    const search = document.getElementById("searchBox");
    if(search){
        search.addEventListener("input", applyFilters);
    }
});