const API =
    "https://shaurya-backend.onrender.com";


const params =
    new URLSearchParams(
        window.location.search
    );


const id =
    params.get("id");


const orderId =
    params.get("order_id");


let productData = null;


// =====================================================
// SAFE DESCRIPTION
// =====================================================

function renderDescription(text){

    if(!text){

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

async function loadProduct(){

    try{

        const res =
            await fetch(
                API + "/products"
            );


        if(!res.ok){

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


        if(!product){

            document.body.innerHTML =
                "<h1>Product Not Found</h1>";

            return;
        }


        productData =
            product;


        // =================================================
        // TITLE
        // =================================================

        document.getElementById(
            "title"
        ).textContent =
            product.title;


        // =================================================
        // DESCRIPTION
        // =================================================

        document.getElementById(
            "description"
        ).innerHTML =
            renderDescription(
                product.description
            );


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


        if(
            original &&
            original > price
        ){

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
                ">

                    <span style="
                        color:#ff4d4d;
                        font-weight:600;
                    ">

                        -${discount}%

                    </span>


                    <span style="
                        text-decoration:
                            line-through;
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

        else{

            priceBox.innerHTML =
                `
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


        mainImage.src =
            product.cover;


        // IMPORTANT:
        // Initial image stays in 16:9 preview mode

        mainImage.classList.remove(
            "natural-view"
        );


        // =================================================
        // PREVIEW IMAGES
        // =================================================

        const previewRow =
            document.getElementById(
                "previewRow"
            );


        if(
            previewRow &&
            product.preview &&
            product.preview.length
        ){

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


                    // First thumbnail active
                    if(index === 0){

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
        // PAYMENT VERIFICATION
        // =================================================

        if(orderId){

            verifyPaymentAndDownload();
        }


    }

    catch(error){

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
){

    const mainImage =
        document.getElementById(
            "mainImage"
        );


    if(!mainImage){

        return;
    }


    // =================================================
    // CHANGE IMAGE
    // =================================================

    mainImage.src =
        src;


    // =================================================
    // SHOW ORIGINAL ASPECT RATIO
    // =================================================

    mainImage.classList.add(
        "natural-view"
    );


    // =================================================
    // ACTIVE THUMBNAIL
    // =================================================

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


    if(clickedThumbnail){

        clickedThumbnail.classList.add(
            "active-preview"
        );
    }
}


// =====================================================
// VERIFY PAYMENT
// =====================================================

async function verifyPaymentAndDownload(){

    try{

        const res =
            await fetch(
                API + "/verify-payment",
                {
                    method:"POST",

                    headers:{
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


        if(!data.success){

            alert(
                "Payment failed ❌"
            );

            return;
        }


        showDownloadUI();

    }

    catch(error){

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

function showDownloadUI(){

    const btn =
        document.getElementById(
            "buyBtn"
        );


    if(!btn){

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

function startDownload(){

    if(!productData){

        alert(
            "Product data is not available."
        );

        return;
    }


    const fileUrl =
        productData.type === "photo"
            ? productData.original
            : productData.zip;


    if(!fileUrl){

        alert(
            "Download file is unavailable."
        );

        return;
    }


    fetch(fileUrl)

        .then(
            res => {

                if(!res.ok){

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
                    productData.title;


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


        if(buyBtn){

            buyBtn.onclick =
                () => {

                    const phone =
                        document.getElementById(
                            "userPhone"
                        ).value.trim();


                    const email =
                        document.getElementById(
                            "userEmail"
                        ).value.trim();


                    if(!phone || !email){

                        alert(
                            "Enter phone number and email."
                        );

                        return;
                    }


                    window.location.href =
                        `/checkout.html?id=${encodeURIComponent(
                            id
                        )}&phone=${encodeURIComponent(
                            phone
                        )}&email=${encodeURIComponent(
                            email
                        )}`;
                };
        }


        loadProduct();
    }
);