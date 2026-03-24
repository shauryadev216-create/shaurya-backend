const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// 🔥 MONGODB CONNECT
// =========================
mongoose.connect(
    "mongodb+srv://Shaurya_dev:Yuvraj123@cluster0.c1l4iyt.mongodb.net/productsDB?retryWrites=true&w=majority"
)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ Mongo Error:", err));

// =========================
// PRODUCT SCHEMA
// =========================
const productSchema = new mongoose.Schema({
    id: String,
    title: String,
    price: Number,
    cover: String,
    preview: Array,
    description: String,
    type: String,
    original: String,
    zip: String
});

const Product = mongoose.model("Product", productSchema);

// =========================
// ADD PRODUCT (ADMIN)
// =========================
app.post("/add-product", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// =========================
// GET PRODUCTS
// =========================
app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// =========================
// CREATE ORDER (CASHFREE)
// =========================
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;

app.post("/create-order", async (req, res) => {

    const { amount, id } = req.body;
    const orderId = "order_" + Date.now();

    try {

        const response = await axios.post(
            "https://api.cashfree.com/pg/orders",
            {
                order_amount: Number(amount),
                order_currency: "INR",
                order_id: orderId,
                customer_details: {
                    customer_id: "user_" + Date.now(),
                    customer_phone: "9999999999"
                },
                order_meta: {
                    return_url: `https://YOUR_NETLIFY_URL/product-template.html?id=${id}&order_id=${orderId}`
                }
            },
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2022-09-01",
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            payment_session_id: response.data.payment_session_id
        });

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Order failed" });
    }
});

// =========================
// VERIFY PAYMENT
// =========================
app.post("/verify-payment", async (req, res) => {

    const { order_id } = req.body;

    try {

        const response = await axios.get(
            `https://api.cashfree.com/pg/orders/${order_id}`,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2022-09-01"
                }
            }
        );

        res.json({
            success: response.data.order_status === "PAID"
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});

// =========================
// SERVER
// =========================
app.listen(3000, () => {
    console.log("🚀 Server running");
});

app.delete("/delete-product/:id", async (req, res) => {
    await Product.deleteOne({ id: req.params.id });
    res.json({ success: true });
});