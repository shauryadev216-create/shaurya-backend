const API = "https://shaurya-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const orderId = params.get("order_id");

let productData = null;

// ==========================
// SAFE DESCRIPTION
// ==========================
function renderDescription(text) {
    if (!text) return "";

    return text
        .replace(/\r\n/g, "\n")
        .replace(/\n/g, "<br>");
}

// ==========================
// LOAD PRODUCT
// ==========================
async function loadProduct() {

    try {

        const res = await fetch(API + "/products");
        const products = await res.json();

        const product = products.find(
            p => String(p._id) === String(id)
        );

        if (!product) {
            document.body.innerHTML = "<h1>Product Not Found</h1>";
            return;
        }

        productData = product;

        // ==========================
        // TITLE
        // ==========================
        document.getElementById("title").textContent =
            product.title;

        // ==========================
        // DESCRIPTION
        // ==========================
        document.getElementById("description").innerHTML =
            renderDescription(product.description);

        // ==========================
        // PRICE + DISCOUNT
        // ==========================
        const priceBox = document.getElementById("price");

        const price = Number(product.price);
        const original = Number(product.originalPrice || 0);

        if (original && original > price) {

            const discount = Math.round(
                ((original - price) / original) * 100
            );

            priceBox.innerHTML = `
                <div class="discount-line">

                    <span class="discount-percent">
                        -${discount}%
                    </span>

                    <span class="original-price">
                        ₹${original}
                    </span>

                </div>

                <div class="current-price">
                    ₹${price}
                </div>
            `;

        } else {

            priceBox.innerHTML = `
                <div class="current-price">
                    ₹${price}
                </div>
            `;
        }

        // ==========================
        // MAIN IMAGE
        // ==========================
        const mainImage =
            document.getElementById("mainImage");

        mainImage.src = product.cover;

        // ==========================
        // PREVIEW IMAGES
        // ==========================
        const previewRow =
            document.getElementById("previewRow");

        if (
            previewRow &&
            product.preview &&
            product.preview.length
        ) {

            previewRow.innerHTML = "";

            product.preview.forEach(img => {

                const preview = document.createElement("img");

                preview.src = img;

                preview.onclick = function () {
                    changeImage(img);
                };

                previewRow.appendChild(preview);
            });
        }

        // ==========================
        // PAYMENT RETURN
        // ==========================
        if (orderId) {
            await verifyPaymentAndDownload();
        }

    } catch (err) {

        console.error("LOAD PRODUCT ERROR:", err);

        document.body.innerHTML =
            "<h1>Unable to load product</h1>";
    }
}

// ==========================
// CHANGE IMAGE
// ==========================
function changeImage(src) {

    document.getElementById("mainImage").src = src;
}

// ==========================
// CREATE CASHFREE ORDER
// ==========================
async function startPayment() {

    try {

        if (!productData) {
            alert("Product is still loading. Please wait.");
            return;
        }

        const phone =
            document.getElementById("userPhone").value.trim();

        const email =
            document.getElementById("userEmail").value.trim();

        if (!phone || !email) {
            alert("Please enter phone number and email.");
            return;
        }

        const buyBtn =
            document.getElementById("buyBtn");

        buyBtn.disabled = true;
        buyBtn.textContent = "Processing...";

        // ==========================
        // SEND ORDER TO BACKEND
        // ==========================
        const res = await fetch(API + "/create-order", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                amount: Number(productData.price),

                id: productData._id,

                phone: phone,

                email: email
            })
        });

        const data = await res.json();

        console.log("CASHFREE RESPONSE:", data);

        // ==========================
        // CHECK PAYMENT SESSION
        // ==========================
        if (!data.payment_session_id) {

            console.error(
                "Cashfree order creation failed:",
                data
            );

            alert(
                "Payment could not be started. Please try again."
            );

            buyBtn.disabled = false;
            buyBtn.textContent = "Buy Now";

            return;
        }

        // ==========================
        // OPEN CASHFREE CHECKOUT
        // ==========================
        const cashfree = Cashfree({
            mode: "sandbox"
        });

        cashfree.checkout({

            paymentSessionId:
                data.payment_session_id,

            redirectTarget: "_self"
        });

    } catch (err) {

        console.error(
            "PAYMENT ERROR:",
            err
        );

        alert(
            "Something went wrong while starting payment."
        );

        const buyBtn =
            document.getElementById("buyBtn");

        buyBtn.disabled = false;
        buyBtn.textContent = "Buy Now";
    }
}

// ==========================
// VERIFY PAYMENT
// ==========================
async function verifyPaymentAndDownload() {

    try {

        const res = await fetch(
            API + "/verify-payment",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    order_id: orderId
                })
            }
        );

        const data = await res.json();

        console.log(
            "PAYMENT VERIFICATION:",
            data
        );

        if (!data.success) {

            alert(
                "Payment could not be verified."
            );

            return;
        }

        showDownloadUI();

    } catch (err) {

        console.error(
            "PAYMENT VERIFICATION ERROR:",
            err
        );

        alert(
            "Unable to verify payment."
        );
    }
}

// ==========================
// SHOW DOWNLOAD BUTTON
// ==========================
function showDownloadUI() {

    const btn =
        document.getElementById("buyBtn");

    if (!btn) return;

    btn.textContent = "Download Now";

    btn.disabled = false;

    btn.onclick = function () {
        startDownload();
    };

    // Remove phone/email fields after successful payment
    const phone =
        document.getElementById("userPhone");

    const email =
        document.getElementById("userEmail");

    if (phone) {
        phone.style.display = "none";
    }

    if (email) {
        email.style.display = "none";
    }

    // Small success message
    let message =
        document.getElementById("paymentSuccessMessage");

    if (!message) {

        message =
            document.createElement("p");

        message.id =
            "paymentSuccessMessage";

        message.style.color = "green";
        message.style.marginTop = "12px";
        message.style.fontWeight = "600";

        btn.parentElement.appendChild(message);
    }

    message.textContent =
        "Payment successful! Your download is ready.";
}

// ==========================
// DOWNLOAD FILE
// ==========================
function startDownload() {

    if (!productData) {

        alert(
            "Product is not loaded."
        );

        return;
    }

    let fileUrl = "";

    if (productData.type === "photo") {

        fileUrl =
            productData.original;

    } else if (productData.type === "pack") {

        fileUrl =
            productData.zip;
    }

    if (!fileUrl) {

        alert(
            "Download file is missing."
        );

        return;
    }

    fetch(fileUrl)

        .then(res => {

            if (!res.ok) {
                throw new Error(
                    "Download request failed"
                );
            }

            return res.blob();
        })

        .then(blob => {

            const url =
                URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;

            a.download =
                productData.title;

            document.body.appendChild(a);

            a.click();

            a.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        })

        .catch(err => {

            console.error(
                "DOWNLOAD ERROR:",
                err
            );

            alert(
                "Download failed."
            );
        });
}

// ==========================
// INIT
// ==========================
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const buyBtn =
            document.getElementById("buyBtn");

        if (buyBtn) {

            buyBtn.onclick =
                startPayment;
        }

        loadProduct();
    }
);