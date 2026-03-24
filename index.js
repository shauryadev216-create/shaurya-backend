const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 YOUR CASHFREE KEYS (TEST MODE)
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;

// =========================
// CREATE ORDER
// =========================
app.post("/create-order", async (req, res) => {

    const { amount, id } = req.body;

    try {

        // 🔥 create unique order id
        const orderId = "order_" + Date.now();

        const response = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            {
                order_amount: Number(amount),
                order_currency: "INR",
                order_id: orderId,

                customer_details: {
                    customer_id: "user_" + Date.now(),
                    customer_phone: "9999999999"
                },

                // 🔥 RETURN URL WITH ORDER ID
                order_meta: {
                    return_url: `http://127.0.0.1:5500/product-template.html?id=${id}&order_id=${orderId}`
                }

            },
            {
                headers: {
                    "x-client-id":process.env.APP_ID,
                    "x-client-secret": process.env.SECRET_KEY,
                    "x-api-version": "2022-09-01",
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({
            payment_session_id: response.data.payment_session_id
        });

    } catch (err) {

        console.error("❌ CASHFREE ERROR:", err.response?.data || err.message);

        return res.status(500).json({
            error: "Order creation failed"
        });
    }
});

// =========================
// VERIFY PAYMENT (IMPORTANT 🔐)
// =========================
app.post("/verify-payment", async (req, res) => {

    const { order_id } = req.body;

    try {

        const response = await axios.get(
            `https://sandbox.cashfree.com/pg/orders/${order_id}`,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2022-09-01"
                }
            }
        );

        const status = response.data.order_status;

        if(status === "PAID"){
            return res.json({ success: true });
        } else {
            return res.json({ success: false });
        }

    } catch (err) {

        console.error("❌ VERIFY ERROR:", err.response?.data || err.message);

        return res.status(500).json({ success: false });
    }
});

// =========================
// SERVER
// =========================
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});

