const API = "https://shaurya-backend.onrender.com";

let editId = null;

// =====================================================
// ADMIN AUTHENTICATION CHECK
// =====================================================

async function checkAdminAccess() {

    try {

        const response =
            await fetch(
                API + "/admin-check",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!response.ok) {

            window.location.replace(
                "/admin-login.html"
            );

            return false;
        }

        const data =
            await response.json();

        if (
            !data.success ||
            !data.authenticated
        ) {

            window.location.replace(
                "/admin-login.html"
            );

            return false;
        }

        return true;

    }

    catch (error) {

        console.error(
            "ADMIN AUTH CHECK ERROR:",
            error
        );

        window.location.replace(
            "/admin-login.html"
        );

        return false;
    }
}


// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

async function uploadToCloudinary(file) {

    if (!file) {
        throw new Error("No file selected");
    }

    const url =
        "https://api.cloudinary.com/v1_1/dayaij4yc/auto/upload";

    const fd = new FormData();

    fd.append("file", file);
    fd.append("upload_preset", "unsigned_preset");

    const res = await fetch(url, {
        method: "POST",
        body: fd
    });

    const data = await res.json();

    if (!res.ok || !data.secure_url) {

        console.error("Cloudinary error:", data);

        throw new Error(
            data.error?.message || "Cloudinary upload failed"
        );
    }

    return data.secure_url;
}


// =====================================================
// DESCRIPTION FORMAT
// =====================================================

function formatDescription(text) {

    if (!text) return "";

    return text.replace(/\r?\n/g, "<br><br>");
}


// =====================================================
// DISCOUNT PREVIEW
// =====================================================

function updateDiscount() {

    const originalElement =
        document.getElementById("originalPrice");

    const priceElement =
        document.getElementById("price");

    const box =
        document.getElementById("discountPreview");

    if (!originalElement || !priceElement || !box) {
        return;
    }

    const original =
        parseFloat(originalElement.value);

    const price =
        parseFloat(priceElement.value);

    if (
        !isNaN(original) &&
        !isNaN(price) &&
        original > price &&
        original > 0
    ) {

        const percent =
            Math.round(
                ((original - price) / original) * 100
            );

        box.innerHTML =
            `🔥 ${percent}% OFF`;

    } else {

        box.innerHTML = "";
    }
}


// =====================================================
// GET SELECTED CATEGORIES
// =====================================================

function getCategories() {

    const category = [];

    document
        .querySelectorAll(
            ".category-box input[type='checkbox']:checked"
        )
        .forEach(c => {
            category.push(c.value);
        });

    return category;
}


// =====================================================
// TYPE UI
// =====================================================

function updateUploadSections() {

    const selectedType =
        document.querySelector(
            'input[name="type"]:checked'
        )?.value;

    const photoSection =
        document.getElementById("photoSection");

    const packSection =
        document.getElementById("packSection");

    const photoCover =
        document.getElementById("photoCover");

    const photoOriginal =
        document.getElementById("photoOriginal");

    const packPreview =
        document.getElementById("packPreview");

    const packZip =
        document.getElementById("packZip");


    if (!photoSection || !packSection) {
        return;
    }


    // =================================================
    // PHOTO SELECTED
    // =================================================

    if (selectedType === "photo") {

        photoSection.classList.remove("disabled-section");
        photoSection.classList.add("active-section");

        packSection.classList.remove("active-section");
        packSection.classList.add("disabled-section");


        if (photoCover) {
            photoCover.disabled = false;
        }

        if (photoOriginal) {
            photoOriginal.disabled = false;
        }

        if (packPreview) {
            packPreview.disabled = true;
        }

        if (packZip) {
            packZip.disabled = true;
        }

    }


    // =================================================
    // PACK SELECTED
    // =================================================

    else if (selectedType === "pack") {

        packSection.classList.remove("disabled-section");
        packSection.classList.add("active-section");

        photoSection.classList.remove("active-section");
        photoSection.classList.add("disabled-section");


        if (photoCover) {
            photoCover.disabled = true;
        }

        if (photoOriginal) {
            photoOriginal.disabled = true;
        }

        if (packPreview) {
            packPreview.disabled = false;
        }

        if (packZip) {
            packZip.disabled = false;
        }
    }
}


// =====================================================
// UPLOAD PHOTO PRODUCT
// =====================================================

async function preparePhotoProduct(product) {

    const coverInput =
        document.getElementById("photoCover");

    const originalInput =
        document.getElementById("photoOriginal");

    const coverFile =
        coverInput?.files?.[0];

    const originalFile =
        originalInput?.files?.[0];


    // =================================================
    // NEW PHOTO PRODUCT
    // =================================================

    if (!editId) {

        if (!coverFile) {
            throw new Error(
                "Please upload the Preview / Cover Photo."
            );
        }

        if (!originalFile) {
            throw new Error(
                "Please upload the Downloadable HD Photo."
            );
        }

        product.cover =
            await uploadToCloudinary(coverFile);

        product.original =
            await uploadToCloudinary(originalFile);

        product.preview =
            [product.cover];

        return;
    }


    // =================================================
    // EDIT EXISTING PHOTO PRODUCT
    // =================================================

    if (coverFile) {

        product.cover =
            await uploadToCloudinary(coverFile);

        product.preview =
            [product.cover];
    }

    if (originalFile) {

        product.original =
            await uploadToCloudinary(originalFile);
    }
}


// =====================================================
// UPLOAD PACK PRODUCT
// =====================================================

async function preparePackProduct(product) {

    const previewInput =
        document.getElementById("packPreview");

    const zipInput =
        document.getElementById("packZip");

    const previewFiles =
        previewInput?.files || [];

    const zipFile =
        zipInput?.files?.[0];


    // =================================================
    // NEW PACK
    // =================================================

    if (!editId) {

        if (!previewFiles.length) {
            throw new Error(
                "Please upload at least one Pack Preview Photo."
            );
        }

        if (!zipFile) {
            throw new Error(
                "Please upload the Downloadable ZIP File."
            );
        }

        const previews = [];

        for (const file of previewFiles) {

            const url =
                await uploadToCloudinary(file);

            previews.push(url);
        }

        product.preview =
            previews;

        product.cover =
            previews[0] || "";

        product.zip =
            await uploadToCloudinary(zipFile);

        return;
    }


    // =================================================
    // EDIT EXISTING PACK
    // =================================================

    if (previewFiles.length) {

        const previews = [];

        for (const file of previewFiles) {

            const url =
                await uploadToCloudinary(file);

            previews.push(url);
        }

        product.preview =
            previews;

        product.cover =
            previews[0] || product.cover;
    }


    if (zipFile) {

        product.zip =
            await uploadToCloudinary(zipFile);
    }
}


// =====================================================
// SAVE / UPDATE PRODUCT
// =====================================================

async function addProduct() {

    const saveBtn =
        document.getElementById("saveBtn");

    const currentEditId =
        editId;

    try {

        if (saveBtn) {

            saveBtn.disabled = true;

            saveBtn.textContent =
                currentEditId
                    ? "Updating..."
                    : "Saving...";
        }


        // =================================================
        // BASIC DATA
        // =================================================

        const title =
            document
                .getElementById("title")
                .value
                .trim();

        const price =
            document
                .getElementById("price")
                .value
                .trim();

        const originalPrice =
            document
                .getElementById("originalPrice")
                .value
                .trim();

        const rawDescription =
            document
                .getElementById("description")
                .value;

        const typeElement =
            document.querySelector(
                'input[name="type"]:checked'
            );


        if (!title) {
            throw new Error(
                "Please enter a Product Title."
            );
        }

        if (!price) {
            throw new Error(
                "Please enter the Discount Price."
            );
        }

        if (!typeElement) {
            throw new Error(
                "Please select Photo or Pack."
            );
        }


        const type =
            typeElement.value;


        const priceNumber =
            Number(price);

        const originalNumber =
            Number(originalPrice) || 0;


        if (
            isNaN(priceNumber) ||
            priceNumber <= 0
        ) {

            throw new Error(
                "Please enter a valid Discount Price."
            );
        }


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            formatDescription(
                rawDescription
            );


        // =================================================
        // CATEGORIES
        // =================================================

        const category =
            getCategories();


        // =================================================
        // DISCOUNT
        // =================================================

        let discount = 0;

        if (
            originalNumber > 0 &&
            originalNumber > priceNumber
        ) {

            discount =
                Math.round(
                    (
                        (originalNumber - priceNumber) /
                        originalNumber
                    ) * 100
                );
        }


        // =================================================
        // PRODUCT OBJECT
        // =================================================

        const product = {

            id:
                currentEditId ||
                Date.now().toString(),

            title:
                title,

            price:
                priceNumber,

            originalPrice:
                originalNumber,

            discount:
                discount,

            description:
                description,

            category:
                category,

            type:
                type
        };


        // =================================================
        // FILES
        // =================================================

        if (type === "photo") {

            await preparePhotoProduct(
                product
            );

        } else {

            await preparePackProduct(
                product
            );
        }


        // =================================================
        // SEND TO BACKEND
        // =================================================

        let response;


        // =================================================
        // UPDATE EXISTING PRODUCT
        // =================================================

        if (currentEditId) {

            response =
                await fetch(
                    API +
                    "/update-product/" +
                    encodeURIComponent(
                        currentEditId
                    ),

                    {
                        method: "PUT",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                product
                            )
                    }
                );

        }


        // =================================================
        // CREATE NEW PRODUCT
        // =================================================

        else {

            response =
                await fetch(
                    API +
                    "/add-product",

                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                product
                            )
                    }
                );
        }


        // =================================================
        // READ RESPONSE
        // =================================================

        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Server returned an invalid response."
            );
        }


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Backend response:",
                data
            );

            throw new Error(
                data.error ||
                data.message ||
                "Server failed to save the product."
            );
        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            currentEditId
                ? "✅ Product updated successfully!"
                : "✅ Product added successfully!"
        );


        editId = null;


        resetForm();


        await loadProducts();


    } catch (err) {

        console.error(
            "SAVE PRODUCT ERROR:",
            err
        );

        alert(
            "❌ " +
            (
                err.message ||
                "Something went wrong."
            )
        );

    } finally {

        if (saveBtn) {

            saveBtn.disabled = false;

            saveBtn.textContent =
                editId
                    ? "Update Product"
                    : "Save Product";
        }
    }
}


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    document.getElementById(
        "title"
    ).value = "";

    document.getElementById(
        "originalPrice"
    ).value = "";

    document.getElementById(
        "price"
    ).value = "";

    document.getElementById(
        "description"
    ).value = "";


    const discountBox =
        document.getElementById(
            "discountPreview"
        );

    if (discountBox) {
        discountBox.innerHTML = "";
    }


    // =================================================
    // RESET CATEGORIES
    // =================================================

    document
        .querySelectorAll(
            ".category-box input[type='checkbox']"
        )
        .forEach(input => {

            input.checked = false;
        });


    // =================================================
    // RESET TYPE TO PHOTO
    // =================================================

    const photoRadio =
        document.querySelector(
            'input[name="type"][value="photo"]'
        );

    if (photoRadio) {

        photoRadio.checked = true;
    }


    // =================================================
    // RESET FILE INPUTS
    // =================================================

    const fileInputs =
        document.querySelectorAll(
            'input[type="file"]'
        );

    fileInputs.forEach(input => {

        input.value = "";
    });


    editId = null;


    updateUploadSections();


    const saveBtn =
        document.getElementById(
            "saveBtn"
        );

    if (saveBtn) {

        saveBtn.textContent =
            "Save Product";
    }
}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    try {

        const res =
            await fetch(
                API + "/products"
            );

        if (!res.ok) {

            throw new Error(
                "Could not load products."
            );
        }

        const products =
            await res.json();

        renderProducts(
            products
        );

    } catch (err) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            err
        );

        const box =
            document.getElementById(
                "product-list-admin"
            );

        if (box) {

            box.innerHTML =
                `
                <p style="color:red;">
                    Failed to load products.
                </p>
                `;
        }
    }
}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

    if (!confirm(
        "Are you sure you want to delete this product?"
    )) {
        return;
    }


    try {

        const res =
            await fetch(
                API +
                "/delete-product/" +
                encodeURIComponent(id),

                {
                    method: "DELETE",

                    credentials: "include"
                }
            );


        const data =
            await res.json();


        if (!data.success) {

            throw new Error(
                data.error ||
                "Delete failed."
            );
        }


        alert(
            "🗑️ Product deleted."
        );


        await loadProducts();


    } catch (err) {

        console.error(
            "DELETE ERROR:",
            err
        );

        alert(
            "❌ Delete failed: " +
            err.message
        );
    }
}


// =====================================================
// EDIT PRODUCT
// =====================================================

function editProduct(p) {

    document.getElementById(
        "title"
    ).value =
        p.title || "";


    document.getElementById(
        "price"
    ).value =
        p.price || "";


    document.getElementById(
        "originalPrice"
    ).value =
        p.originalPrice || "";


    // =================================================
    // DESCRIPTION
    // =================================================

    document.getElementById(
        "description"
    ).value =
        (p.description || "")
            .replace(/<br><br>/g, "\n")
            .replace(/<br>/g, "\n");


    // =================================================
    // TYPE
    // =================================================

    const typeRadio =
        document.querySelector(
            `input[name="type"][value="${p.type}"]`
        );

    if (typeRadio) {

        typeRadio.checked = true;
    }


    // =================================================
    // UPDATE UPLOAD UI
    // =================================================

    updateUploadSections();


    // =================================================
    // CATEGORIES
    // =================================================

    document
        .querySelectorAll(
            ".category-box input[type='checkbox']"
        )
        .forEach(input => {

            input.checked =
                Array.isArray(
                    p.category
                ) &&
                p.category.includes(
                    input.value
                );
        });


    // =================================================
    // IMPORTANT:
    // USE MONGODB _id FIRST
    // =================================================

    editId =
        p._id ||
        p.id;


    document.getElementById(
        "saveBtn"
    ).textContent =
        "Update Product";


    updateDiscount();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// RENDER ADMIN PRODUCT LIST
// =====================================================

function renderProducts(products) {

    const box =
        document.getElementById(
            "product-list-admin"
        );

    if (!box) {
        return;
    }


    box.innerHTML = "";


    if (
        !products ||
        !products.length
    ) {

        box.innerHTML =
            "<p>No products yet.</p>";

        return;
    }


    products.forEach(p => {

        let discountHTML = "";


        if (
            p.originalPrice &&
            p.originalPrice > p.price
        ) {

            const percent =
                Math.round(
                    (
                        (p.originalPrice - p.price) /
                        p.originalPrice
                    ) * 100
                );


            discountHTML =
                `
                <span style="
                    color:#ff4d4d;
                    font-weight:600;
                    margin-left:6px;
                ">
                    -${percent}%
                </span>
                `;
        }


        const productId =
            p._id ||
            p.id;


        box.innerHTML +=
            `

            <div class="admin-card">

                <div>

                    <b>
                        ${escapeHTML(
                            p.title ||
                            "Untitled Product"
                        )}
                    </b>

                    <br>

                    ${
                        p.originalPrice
                            ? `
                                <s>
                                    ₹${p.originalPrice}
                                </s>
                              `
                            : ""
                    }

                    <strong>
                        ₹${p.price || 0}
                    </strong>

                    ${discountHTML}

                    <br>

                    <small>
                        ${p.type || "product"}
                    </small>

                </div>


                <div style="
                    display:flex;
                    gap:10px;
                ">

                    <button
                        class="action-btn edit-btn"
                        onclick='editProduct(${JSON.stringify(p)})'
                    >
                        Edit
                    </button>


                    <button
                        class="action-btn delete-btn"
                        onclick='deleteProduct("${productId}")'
                    >
                        Delete
                    </button>

                </div>

            </div>

            `;
    });
}


// =====================================================
// SIMPLE HTML ESCAPE
// =====================================================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =================================================
        // CHECK ADMIN AUTHENTICATION FIRST
        // =================================================

        const authenticated =
            await checkAdminAccess();

        if (!authenticated) {
            return;
        }


        console.log(
            "✅ Admin authentication successful"
        );


        // =================================================
        // SAVE BUTTON
        // =================================================

        const saveBtn =
            document.getElementById(
                "saveBtn"
            );


        if (!saveBtn) {

            console.error(
                "❌ Save button not found!"
            );

            return;
        }


        saveBtn.addEventListener(
            "click",
            addProduct
        );


        // =================================================
        // TYPE SWITCH
        // =================================================

        document
            .querySelectorAll(
                'input[name="type"]'
            )
            .forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        updateUploadSections
                    );

                }
            );


        // =================================================
        // DISCOUNT
        // =================================================

        const originalPrice =
            document.getElementById(
                "originalPrice"
            );


        const price =
            document.getElementById(
                "price"
            );


        if (originalPrice) {

            originalPrice.addEventListener(
                "input",
                updateDiscount
            );

        }


        if (price) {

            price.addEventListener(
                "input",
                updateDiscount
            );

        }


        // =================================================
        // INITIAL UPLOAD UI
        // =================================================

        updateUploadSections();


        // =================================================
        // LOAD PRODUCTS
        // =================================================

        loadProducts();

    }
);