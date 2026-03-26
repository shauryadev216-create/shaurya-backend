let allProducts = [];
let currentFilter = "all";

const API = "https://shaurya-backend.onrender.com";

// =========================
// SAFE CATEGORY
// =========================
function safeCategory(cat){
    if(!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
}

// =========================
// LOAD FROM DATABASE
// =========================
async function loadProducts(){

    try{
        const res = await fetch(API + "/products");

        if(!res.ok){
            throw new Error("Server error");
        }

        const data = await res.json();

        // Ensure array
        allProducts = Array.isArray(data) ? data : [];

        applyFilters();

    }catch(err){
        console.error("Load error:", err);

        const container = document.getElementById("product-list");
        if(container){
            container.innerHTML = "<p>⚠️ Failed to load products</p>";
        }
    }
}

// =========================
// RENDER
// =========================
function renderProducts(list){

    const container = document.getElementById("product-list");

    if(!container) return;

    container.innerHTML = "";

    if(!list || list.length === 0){
        container.innerHTML = "<p>No products found</p>";
        return;
    }

    list.forEach(p=>{

        const categories = safeCategory(p.category);

        const div = document.createElement("div");
        div.className = "shop-card";

        div.innerHTML = `
        <div class="shop-image">
            <img src="${p.cover || "https://via.placeholder.com/300"}">
        </div>

        <div class="shop-content">
            <span class="shop-tag">${p.type || "product"}</span>
            <h3>${p.title || "Untitled"}</h3>
            <p>${categories.join(", ")}</p>

            <div class="shop-footer">
                <span class="price">$${p.price || 0}</span>
                <a href="product-template.html?id=${p._id}" class="btn-buy">View</a>
            </div>
        </div>
        `;

        container.appendChild(div);
    });
}

// =========================
// FILTER BUTTON
// =========================
function filterCategory(cat){
    currentFilter = cat;
    applyFilters();
}

// =========================
// SEARCH
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("searchBox");

    if(search){
        search.addEventListener("input", applyFilters);
    }
});

// =========================
// APPLY FILTERS
// =========================
function applyFilters(){

    let filtered = [...allProducts];

    const searchBox = document.getElementById("searchBox");
    const query = searchBox ? searchBox.value.toLowerCase() : "";

    // SEARCH
    if(query){
        filtered = filtered.filter(p =>
            (p.title || "").toLowerCase().includes(query) ||
            safeCategory(p.category).join(" ").toLowerCase().includes(query)
        );
    }

    // FILTER
    if(currentFilter === "pack"){
        filtered = filtered.filter(p => p.type === "pack");
    }
    else if(currentFilter === "photo"){
        filtered = filtered.filter(p => p.type === "photo");
    }
    else if(currentFilter !== "all"){
        filtered = filtered.filter(p =>
            safeCategory(p.category).includes(currentFilter)
        );
    }

    renderProducts(filtered);
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", loadProducts);