const API = "https://shaurya-backend.onrender.com";

let allImages = [];
let currentCategory = "all";

// =========================
// LOAD GALLERY
// =========================
async function loadGallery(){

    try{

        const res = await fetch(API + "/products");
        const products = await res.json(); // ✅ NOW defined

        console.log("Products:", products);

        allImages = [];

        products.forEach(product => {

            if(product.preview && product.preview.length){

                product.preview.forEach(img => {

                    allImages.push({
                        img: img,
                        title: product.title,
                        category: product.category || [],
                        id: product._id
                    });

                });

            }

        });

        renderGallery(allImages);

    }catch(err){
        console.error("Gallery error:", err);
    }
}

// =========================
// RENDER
// =========================
function renderGallery(images){

    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";

    if(!images.length){
        grid.innerHTML = "<p>No images found</p>";
        return;
    }

    images.forEach(item => {

        grid.innerHTML += `
        <div class="gallery-item"
        onclick="openProduct('${item.id}')">

            <img src="${item.img}">

            <div class="gallery-title">
                ${item.title}
            </div>

        </div>
        `;
    });
}

// =========================
// SEARCH
// =========================
document.getElementById("searchBox").addEventListener("input", function(){

    const val = this.value.toLowerCase();

    const filtered = allImages.filter(item =>
        item.title.toLowerCase().includes(val) ||
        item.category.join(" ").toLowerCase().includes(val)
    );

    renderGallery(filtered);
});

// =========================
// FILTER
// =========================
function filterCategory(cat){

    currentCategory = cat;

    if(cat === "all"){
        renderGallery(allImages);
        return;
    }

    const filtered = allImages.filter(item =>
        item.category.includes(cat)
    );

    renderGallery(filtered);
}

// =========================
// OPEN PRODUCT
// =========================
function openProduct(id){
    window.location.href = `/product-template.html?id=${id}`;
}

// INIT
loadGallery();