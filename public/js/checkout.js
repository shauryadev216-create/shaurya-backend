const API =
    "https://shaurya-backend.onrender.com";


// =====================================================
// URL PARAMETERS
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );


// Support both names
const productId =
    params.get("productId") ||
    params.get("id");

const phone =
    params.get("phone") || "";

const email =
    params.get("email") || "";


let productData = null;


// =====================================================
// LOAD PRODUCT
// =====================================================

async function loadProduct() {

    try {

        if (!productId) {

            document.body.innerHTML = `
                <div style="
                    padding:50px;
                    text-align:center;
                    font-family:Arial;
                ">

                    <h1>Product ID Missing</h1>

                    <p>
                        Please return to the product page
                        and try again.
                    </p>

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


        // =================================================
        // FIND PRODUCT
        // =================================================

        const product =
            products.find(
                p =>
                    String(p._id) ===
                    String(productId)
            );


        if (!product) {

            document.body.innerHTML = `
                <div style="
                    padding:50px;
                    text-align:center;
                    font-family:Arial;
                ">

                    <h1>Product Not Found</h1>

                    <p>
                        This product may have been removed.
                    </p>

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
        // IMAGE
        // =================================================

        const image =
            document.getElementById(
                "productImage"
            );

        if (image) {

            image.src =
                product.cover || "";

            image.alt =
                product.title || "Product";
        }


        // =================================================
        // PRICE
        // =================================================

        const price =
            Number(product.price || 0);

        const original =
            Number(
                product.originalPrice || 0
            );


        const priceBox =
            document.getElementById(
                "price"
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

                <span style="
                    text-decoration:line-through;
                    color:#888;
                ">

                    ₹${original}

                </span>


                <span style="
                    color:red;
                    margin-left:8px;
                ">

                    -${discount}%

                </span>


                <br>


                <b style="
                    font-size:22px;
                ">

                    ₹${price}

                </b>

            `;

        }

        else if (priceBox) {

            priceBox.innerHTML = `

                <b style="
                    font-size:22px;
                ">

                    ₹${price}

                </b>

            `;
        }


        // =================================================
        // QUANTITY
        // =================================================

        const quantity =
            document.getElementById(
                "quantity"
            );

        if (quantity) {

            quantity.textContent =
                "1";
        }


        // =================================================
        // TOTAL
        // =================================================

        const total =
            document.getElementById(
                "total"
            );


        if (total) {

            total.textContent =
                `₹${price}`;
        }


        // =================================================
        // PHONE
        // =================================================

        const phoneInput =
            document.getElementById(
                "phone"
            );

        if (phoneInput) {

            phoneInput.value =
                phone;
        }


        // =================================================
        // EMAIL
        // =================================================

        const emailInput =
            document.getElementById(
                "email"
            );

        if (emailInput) {

            emailInput.value =
                email;
        }


        console.log(
            "CHECKOUT PRODUCT:",
            product
        );

        console.log(
            "CHECKOUT PRODUCT ID:",
            product._id
        );

    }

    catch (err) {

        console.error(
            "LOAD ERROR:",
            err
        );


        alert(
            "Failed to load product ❌"
        );
    }
}


// =====================================================
// PAY NOW
// =====================================================

async function payNow() {

    const btn =
        document.querySelector(
            ".pay-btn"
        );


    try {

        if (!productData) {

            alert(
                "Product not loaded ❌"
            );

            return;
        }


        // =================================================
        // CUSTOMER DETAILS
        // =================================================

        const phoneInput =
            document.getElementById(
                "phone"
            );


        const emailInput =
            document.getElementById(
                "email"
            );


        const phoneVal =
            phoneInput
                ? phoneInput.value.trim()
                : "";


        const emailVal =
            emailInput
                ? emailInput.value.trim()
                : "";


        if (!phoneVal || !emailVal) {

            alert(
                "Enter phone & email"
            );

            return;
        }


        // =================================================
        // BUTTON
        // =================================================

        if (btn) {

            btn.innerText =
                "Processing...";

            btn.disabled =
                true;
        }


        // =================================================
        // PRODUCT ID
        // =================================================

        const realProductId =
            productData._id ||
            productData.id;


        if (!realProductId) {

            throw new Error(
                "Product ID is missing."
            );
        }


        // =================================================
        // CREATE CASHFREE ORDER
        // =================================================

        const orderPayload = {

            productId:
                String(realProductId),

            // Keep id too for compatibility
            id:
                String(realProductId),

            amount:
                Number(productData.price),

            phone:
                phoneVal,

            email:
                emailVal
        };


        console.log(
            "CREATE ORDER PAYLOAD:",
            orderPayload
        );


        const res =
            await fetch(
                API + "/create-order",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            orderPayload
                        )
                }
            );


        const data =
            await res.json();


        console.log(
            "BACKEND RESPONSE:",
            data
        );


        // =================================================
        // BACKEND ERROR
        // =================================================

        if (
            !res.ok ||
            !data.payment_session_id
        ) {

            console.error(
                "CREATE ORDER FAILED:",
                data
            );


            alert(
                data.message ||
                data.error?.message ||
                "Payment init failed ❌\nCheck console."
            );


            if (btn) {

                btn.innerText =
                    "Proceed to Payment";

                btn.disabled =
                    false;
            }


            return;
        }


        // =================================================
        // CASHFREE
        // =================================================

        const cashfree =
            Cashfree({
                mode: "sandbox"
            });


        await cashfree.checkout({

            paymentSessionId:
                data.payment_session_id,

            redirectTarget:
                "_self"
        });

    }

    catch (err) {

        console.error(
            "PAY ERROR:",
            err
        );


        alert(
            err.message ||
            "Something went wrong ❌"
        );


        if (btn) {

            btn.innerText =
                "Proceed to Payment";

            btn.disabled =
                false;
        }
    }
}


// =====================================================
// START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProduct();

    }
);