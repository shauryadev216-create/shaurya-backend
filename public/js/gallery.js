const API = "https://shaurya-backend.onrender.com";

let allImages = [];

// ==========================
// LOAD
// ==========================
async function loadGallery(){

    try{

        const res = await fetch(API + "/products");
        const products = await res.json();

        const container = document.getElementById("galleryGrid");
        container.innerHTML = "";

        allImages = [];

        products.forEach(product => {

            if(!product.preview || !product.preview.length) return;

            product.preview.forEach(img => {

                allImages.push({
                    img: img,
                    id: product._id,
                    title: product.title,
                    category: product.category || []
                });

            });

        });

        renderGallery(allImages);

    }catch(err){
        console.error(err);
    }
}

// ==========================
// RENDER
// ==========================
function renderGallery(images){

    const container = document.getElementById("galleryGrid");
    container.innerHTML = "";

    if(images.length === 0){
        container.innerHTML = "<p>No images found</p>";
        return;
    }

    images.forEach(item => {

        container.innerHTML += `
        <div class="gallery-item" onclick="goToProduct('${item.id}')">
            <img src="${item.img}">
            <div class="gallery-title">${item.title}</div>
        </div>
        `;
    });
}

// ==========================
// SEARCH
// ==========================
function searchGallery(){

    const value = document.getElementById("searchBox").value.toLowerCase();

    const filtered = allImages.filter(item =>
        item.title.toLowerCase().includes(value) ||
        item.category.join(" ").toLowerCase().includes(value)
    );

    renderGallery(filtered);
}

// ==========================
// FILTER
// ==========================
function filterCategory(cat){

    if(cat === "all"){
        renderGallery(allImages);
        return;
    }

    const filtered = allImages.filter(item =>
        item.category.includes(cat)
    );

    renderGallery(filtered);
}

// ==========================
function goToProduct(id){
    window.location.href = "/product-template.html?id=" + id;
}

document.addEventListener("DOMContentLoaded", loadGallery);