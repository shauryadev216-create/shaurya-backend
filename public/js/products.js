const API = "https://shaurya-backend.onrender.com";

let allProducts = [];
let currentFilter = "all";

function safeCategory(cat){
    if(!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
}

async function loadProducts(){
    try{
        const res = await fetch(API + "/products");
        const data = await res.json();

        allProducts = data;
        applyFilters();

    }catch(err){
        console.error(err);
    }
}

function renderProducts(list){
    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if(list.length === 0){
        container.innerHTML = "<p>No products</p>";
        return;
    }

    list.forEach(p=>{
        const div = document.createElement("div");

        div.className = "shop-card";

div.innerHTML = `
    <div class="shop-image">
        <img src="${p.cover || "https://via.placeholder.com/300"}">
    </div>

    <div class="shop-content">
        <span class="shop-tag">${p.type || "product"}</span>
        <h3>${p.title}</h3>
        <p>$${p.price}</p>

        <div class="shop-footer">
            <a href="product-template.html?id=${p._id}" class="btn-buy">View</a>
        </div>
    </div>
`;

        container.appendChild(div);
    });
}

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

document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();

    const search = document.getElementById("searchBox");
    if(search){
        search.addEventListener("input", applyFilters);
    }
});