const API = "https://shaurya-backend.onrender.com";

let allProducts = [];
let currentFilter = "all";

// ==========================
// LOAD PRODUCTS
// ==========================
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

// ==========================
// RENDER PRODUCTS
// ==========================
function renderProducts(list){

    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if(list.length === 0){
        container.innerHTML = "<p>No products</p>";
        return;
    }

    list.forEach(p=>{

        const previews = p.preview && p.preview.length ? p.preview : [p.cover];

        const div = document.createElement("div");
        div.className = "shop-card";

        div.innerHTML = `
            <img src="${previews[0]}" class="shop-img" onclick='openViewer(${JSON.stringify(previews)})'>

            <h3>${p.title}</h3>
            <p>$${p.price}</p>

            <a href="product-template.html?id=${p._id}" class="view-pack-btn">
                View Product
            </a>
        `;

        container.appendChild(div);
    });
}

// ==========================
// FILTER
// ==========================
function applyFilters(){

    let filtered = [...allProducts];

    const search = document.getElementById("searchBox");
    const query = search ? search.value.toLowerCase() : "";

    if(query){
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query)
        );
    }

    renderProducts(filtered);
}

// ==========================
// IMAGE VIEWER (🔥 MAIN FEATURE)
// ==========================
let currentImages = [];
let currentIndex = 0;

function openViewer(images){

    currentImages = images;
    currentIndex = 0;

    document.getElementById("viewer").style.display = "flex";
    updateViewer();
}

function updateViewer(){
    document.getElementById("viewerImg").src = currentImages[currentIndex];
}

function nextImage(){
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateViewer();
}

function prevImage(){
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateViewer();
}

function closeViewer(){
    document.getElementById("viewer").style.display = "none";
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", ()=>{

    loadProducts();

    const search = document.getElementById("searchBox");
    if(search){
        search.addEventListener("input", applyFilters);
    }
});