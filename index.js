const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// =========================
// 🔥 MONGODB CONNECT
// =========================
const startServer = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("🚀 Server running on port " + PORT);
        });

    } catch (err) {
        console.error("❌ Mongo Connection Failed:", err);
    }
};

startServer();

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
    zip: String,
    category: Array
});

const Product = mongoose.model("Product", productSchema);

// =========================
// ADD PRODUCT (ADMIN)
// =========================
app.post("/add-product", async (req, res) => {
    try {

        console.log("Incoming product:", req.body);

        const product = new Product(req.body);
        await product.save();

        res.json({ success: true });

    } catch (err) {

        console.error("ADD PRODUCT ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// =========================
// GET PRODUCTS
// =========================
app.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json([]);
    }
});

// =========================
// DELETE PRODUCT
// =========================
app.delete("/delete-product/:id", async (req, res) => {
    try {
        await Product.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// =========================
// CASHFREE KEYS
// =========================
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;

// =========================
// CREATE ORDER
// =========================
app.post("/create-order", async (req, res) => {

    const { amount, id } = req.body;
    const orderId = "order_" + Date.now();

    try {

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

        // VERIFY PAYMENT
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

    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});

// =========================
// 🔥 IMPORTANT FIX FOR RENDER
// =========================
const PORT = process.env.PORT || 3000;

