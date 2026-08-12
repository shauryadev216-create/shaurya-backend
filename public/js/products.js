const API = "https://shaurya-backend.onrender.com";

let allProducts = [];
let currentFilter = "all";

function safeCategory(cat) {
    if (!cat) return [];
    return Array.isArray(cat) ? cat : [cat];
}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    try {

        const res = await fetch(API + "/products");

        if (!res.ok) {
            throw new Error("Failed to load products.");
        }

        const data = await res.json();

        allProducts = Array.isArray(data) ? data : [];

        applyFilters();

    } catch (err) {

        console.error("PRODUCT LOAD ERROR:", err);

        const container =
            document.getElementById("product-list");

        if (container) {
            container.innerHTML =
                "<p>Unable to load products.</p>";
        }
    }
}


// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts(list) {

    const container =
        document.getElementById("product-list");

    if (!container) return;

    container.innerHTML = "";

    if (!list.length) {

        container.innerHTML =
            "<p>No products found.</p>";

        return;
    }


    list.forEach(p => {

        const div =
            document.createElement("div");

        div.className = "shop-card";


        div.innerHTML = `
            <div class="shop-image">

                <img
                    src="${p.cover || "https://via.placeholder.com/300"}"
                    alt="${p.title || "Product"}"
                >

            </div>


            <div class="shop-content">

                <span class="shop-tag">
                    ${p.type || "product"}
                </span>


                <h3>
                    ${p.title || "Untitled Product"}
                </h3>


                <p>
                    ₹${p.price ?? 0}
                </p>


                <div class="shop-footer">

                    <a
                        href="product-template.html?id=${p._id || p.id}"
                        class="btn-buy"
                    >
                        View
                    </a>

                </div>

            </div>
        `;


        container.appendChild(div);

    });
}


// =====================================================
// APPLY SEARCH + FILTERS
// =====================================================

function applyFilters() {

    let filtered = [...allProducts];


    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    const search =
        document.getElementById("searchBox");

    const query =
        search
            ? search.value.trim().toLowerCase()
            : "";


    if (query) {

        filtered =
            filtered.filter(p =>

                String(p.title || "")
                    .toLowerCase()
                    .includes(query)

            );

    }


    // -------------------------------------------------
    // CATEGORY / TYPE FILTER
    // -------------------------------------------------

    if (currentFilter !== "all") {

        // PACK + PHOTO are product TYPES
        if (
            currentFilter === "pack" ||
            currentFilter === "photo"
        ) {

            filtered =
                filtered.filter(p =>

                    String(p.type || "")
                        .toLowerCase()
                        .trim() === currentFilter

                );

        }

        // Nature / Cinematic / Macro / B&W
        else {

            filtered =
                filtered.filter(p =>

                    safeCategory(p.category)
                        .some(category =>
                            String(category)
                                .toLowerCase()
                                .trim() === currentFilter
                        )

                );

        }

    }


    renderProducts(filtered);
}


// =====================================================
// FILTER BUTTON
// =====================================================

function filterCategory(cat) {

    currentFilter =
        String(cat)
            .toLowerCase()
            .trim();

    applyFilters();
}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();


        const search =
            document.getElementById("searchBox");


        if (search) {

            search.addEventListener(
                "input",
                applyFilters
            );

        }

    }
);