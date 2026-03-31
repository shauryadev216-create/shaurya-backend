
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// =========================
// 🔥 MONGODB CONNECT
// =========================
mongoose.connect(process.env.MONGO_URI)
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
    zip: String,
    category: Array
});

const Product = mongoose.model("Product", productSchema);

// =========================
// ADD PRODUCT
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
    try {
        const products = await Product.find();
        res.json(products);
    } catch {
        res.json([]);
    }
});

// =========================
// DELETE PRODUCT
// =========================
app.delete("/delete-product/:id", async (req, res) => {
    try {
        await Product.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch {
        res.json({ success: false });
    }
});

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
                    customer_email: "test@test.com",
                    customer_phone: "9999999999"
                },
                order_meta: {
                    return_url: `https://lucky-travesseiro-1da1a0.netlify.app/product-template.html?id=${id}&order_id=${orderId}`
                }
            },
            {
                headers: {
                    "x-client-id": process.env.APP_ID,
                    "x-client-secret": process.env.SECRET_KEY,
                    "x-api-version": "2022-09-01",
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ ORDER CREATED:", response.data);

        res.json({
    success:
        response.data.order_status === "PAID" ||
        response.data.order_status === "ACTIVE"
});

    } catch (err) {
        console.error("❌ ORDER ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "Order failed" });
    }
});

// =========================
// VERIFY PAYMENT (FINAL CLEAN)
// =========================
app.post("/verify-payment", async (req, res) => {

    const { order_id } = req.body;

    try {

        const response = await axios.get(
            `https://sandbox.cashfree.com/pg/orders/${order_id}`,
            {
                headers: {
                    "x-client-id": process.env.APP_ID,
                    "x-client-secret": process.env.SECRET_KEY,
                    "x-api-version": "2022-09-01"
                }
            }
        );

        console.log("🔍 VERIFY RESPONSE:", response.data);

        res.json({
            success:
                response.data.order_status === "PAID" ||
                response.data.order_status === "ACTIVE" // ✅ TEMP FIX
        });

    } catch (err) {
        console.error("❌ VERIFY ERROR:", err.response?.data || err.message);
        res.json({ success: false });
    }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});