const API =
    "https://shaurya-backend.onrender.com";


// =====================================================
// URL PARAMETERS
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const id =
    params.get("id") ||
    params.get("productId");

const orderId =
    params.get("order_id");


// =====================================================
// PRODUCT DATA
// =====================================================

let productData = null;


// =====================================================
// SAFE DESCRIPTION
// =====================================================

function renderDescription(text) {

    if (!text) {
        return "";
    }

    return text
        .replace(/\n/g, "<br>")
        .replace(
            /<br><br>/g,
            "<br><br>"
        );
}


// =====================================================
// LOAD PRODUCT
// =====================================================

async function loadProduct() {

    try {

        if (!id) {

            document.body.innerHTML = `
                <div style="
                    padding:50px;
                    text-align:center;
                    font-family:Arial;
                ">
                    <h1>Product ID Missing</h1>
                    <p>Please open the product from the shop.</p>
                </div>
            `;

            return;
        }


        const res =
            await fetch(
                API + "/products"
            );


        if (!res.ok) {

            throw new Error(
                "Failed to load products"
            );
        }


        const products =
            await res.json();


        const product =
            products.find(
                p =>
                    String(p._id) ===
                    String(id)
            );


        if (!product) {

            document.body.innerHTML = `
                <div style="
                    padding:50px;
                    text-align:center;
                    font-family:Arial;
                ">
                    <h1>Product Not Found</h1>
                    <p>This product may have been removed.</p>
                </div>
            `;

            return;
        }


        productData =
            product;


        // =================================================
        // TITLE
        // =================================================

        const title =
            document.getElementById(
                "title"
            );

        if (title) {

            title.textContent =
                product.title || "";
        }


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            document.getElementById(
                "description"
            );

        if (description) {

            description.innerHTML =
                renderDescription(
                    product.description
                );
        }


        // =================================================
        // PRICE
        // =================================================

        const priceBox =
            document.getElementById(
                "price"
            );


        const price =
            Number(product.price);


        const original =
            Number(
                product.originalPrice || 0
            );


        if (
            priceBox &&
            original &&
            original > price
        ) {

            const discount =
                Math.round(
                    (
                        (original - price) /
                        original
                    ) * 100
                );


            priceBox.innerHTML = `

                <div style="
                    display:flex;
                    gap:10px;
                    align-items:center;
                    margin-bottom:4px;
                ">

                    <span style="
                        color:#ff4d4d;
                        font-weight:600;
                    ">

                        -${discount}%

                    </span>


                    <span style="
                        text-decoration:line-through;
                        color:#888;
                    ">

                        ₹${original}

                    </span>

                </div>


                <div style="
                    font-size:28px;
                    font-weight:700;
                ">

                    ₹${price}

                </div>

            `;

        }

        else if (priceBox) {

            priceBox.innerHTML = `

                <b style="
                    font-size:28px;
                ">

                    ₹${price}

                </b>

            `;
        }


        // =================================================
        // MAIN IMAGE
        // =================================================

        const mainImage =
            document.getElementById(
                "mainImage"
            );


        if (mainImage) {

            mainImage.src =
                product.cover || "";


            mainImage.alt =
                product.title || "Product";


            // Initial image = 16:9 preview
            mainImage.classList.remove(
                "natural-view"
            );
        }


        // =================================================
        // PREVIEW IMAGES
        // =================================================

        const previewRow =
            document.getElementById(
                "previewRow"
            );


        if (
            previewRow &&
            Array.isArray(product.preview) &&
            product.preview.length
        ) {

            previewRow.innerHTML =
                "";


            product.preview.forEach(
                (img, index) => {

                    const el =
                        document.createElement(
                            "img"
                        );


                    el.src =
                        img;


                    el.alt =
                        "Product preview " +
                        (index + 1);


                    if (index === 0) {

                        el.classList.add(
                            "active-preview"
                        );
                    }


                    el.onclick =
                        () => {

                            changeImage(
                                img,
                                el
                            );
                        };


                    previewRow.appendChild(
                        el
                    );
                }
            );
        }


        // =================================================
        // PAYMENT RETURN
        // =================================================

        if (orderId) {

            await verifyPaymentAndDownload();
        }

    }

    catch (error) {

        console.error(
            "LOAD PRODUCT ERROR:",
            error
        );


        document.body.innerHTML = `

            <div style="
                padding:50px;
                text-align:center;
                font-family:Arial;
            ">

                <h1>
                    Failed to load product
                </h1>

                <p>
                    Please try again later.
                </p>

            </div>

        `;
    }
}


// =====================================================
// CHANGE MAIN IMAGE
// =====================================================

function changeImage(
    src,
    clickedThumbnail
) {

    const mainImage =
        document.getElementById(
            "mainImage"
        );


    if (!mainImage) {
        return;
    }


    // Change image
    mainImage.src =
        src;


    // Show natural aspect ratio
    mainImage.classList.add(
        "natural-view"
    );


    // Remove active state
    document
        .querySelectorAll(
            "#previewRow img"
        )
        .forEach(
            img => {

                img.classList.remove(
                    "active-preview"
                );
            }
        );


    // Activate clicked thumbnail
    if (clickedThumbnail) {

        clickedThumbnail.classList.add(
            "active-preview"
        );
    }
}


// =====================================================
// VERIFY PAYMENT
// =====================================================

async function verifyPaymentAndDownload() {

    try {

        if (!orderId) {
            return;
        }


        const res =
            await fetch(
                API + "/verify-payment",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            order_id:
                                orderId
                        })
                }
            );


        const data =
            await res.json();


        console.log(
            "PAYMENT VERIFY RESPONSE:",
            data
        );


        if (!data.success) {

            alert(
                "Payment failed ❌"
            );

            return;
        }


        showDownloadUI();

    }

    catch (error) {

        console.error(
            "PAYMENT VERIFY ERROR:",
            error
        );


        alert(
            "Could not verify payment."
        );
    }
}


// =====================================================
// SHOW DOWNLOAD BUTTON
// =====================================================

function showDownloadUI() {

    const btn =
        document.getElementById(
            "buyBtn"
        );


    if (!btn) {
        return;
    }


    btn.textContent =
        "Download Now";


    btn.onclick =
        startDownload;
}


// =====================================================
// START DOWNLOAD
// =====================================================

function startDownload() {

    if (!productData) {

        alert(
            "Product data is not available."
        );

        return;
    }


    const fileUrl =
        productData.type === "photo"
            ? productData.original
            : productData.zip;


    if (!fileUrl) {

        alert(
            "Download file is unavailable."
        );

        return;
    }


    fetch(fileUrl)

        .then(
            res => {

                if (!res.ok) {

                    throw new Error(
                        "Download failed"
                    );
                }

                return res.blob();
            }
        )

        .then(
            blob => {

                const url =
                    URL.createObjectURL(
                        blob
                    );


                const a =
                    document.createElement(
                        "a"
                    );


                a.href =
                    url;


                a.download =
                    productData.title ||
                    "download";


                document.body.appendChild(
                    a
                );


                a.click();


                a.remove();


                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );
            }
        )

        .catch(
            error => {

                console.error(
                    "DOWNLOAD ERROR:",
                    error
                );


                alert(
                    "Download failed ❌"
                );
            }
        );
}


// =====================================================
// BUY BUTTON
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const buyBtn =
            document.getElementById(
                "buyBtn"
            );


        if (buyBtn) {

            buyBtn.onclick =
                () => {

                    const phoneInput =
                        document.getElementById(
                            "userPhone"
                        );


                    const emailInput =
                        document.getElementById(
                            "userEmail"
                        );


                    const phone =
                        phoneInput
                            ? phoneInput.value.trim()
                            : "";


                    const email =
                        emailInput
                            ? emailInput.value.trim()
                            : "";


                    if (!phone || !email) {

                        alert(
                            "Enter phone number and email."
                        );

                        return;
                    }


                    // =================================================
                    // IMPORTANT
                    // Send BOTH id and productId.
                    // This prevents the "Missing productId" error.
                    // =================================================

                    const checkoutURL =
                        `/checkout.html?id=${encodeURIComponent(
                            id
                        )}&productId=${encodeURIComponent(
                            id
                        )}&phone=${encodeURIComponent(
                            phone
                        )}&email=${encodeURIComponent(
                            email
                        )}`;


                    console.log(
                        "CHECKOUT PRODUCT ID:",
                        id
                    );


                    window.location.href =
                        checkoutURL;
                };
        }


        loadProduct();
    }
);