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
// 🆕 PURCHASE SCHEMA
// =========================
const purchaseSchema = new mongoose.Schema({
    user_email: String,
    product_id: String,
    order_id: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

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
// CREATE ORDER (🔥 FIXED FINAL)
// =========================
app.post("/create-order", async (req, res) => {

    try {

        const { productId, phone, email } = req.body;

        if (!productId) {
            return res.json({ success: false, message: "Missing productId" });
        }

        // 🔥 GET PRODUCT FROM DB (SECURE PRICE)
        const product = await Product.findOne({
            $or: [
                { id: productId },
                { _id: productId }
            ]
        });

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const price = Number(product.price);

        // 🔥 ORDER ID
        const orderId = "order_" + Date.now();

        // =========================
        // CASHFREE ORDER
        // =========================
        const response = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            {
                order_id: orderId,
                order_amount: price,
                order_currency: "INR",

                customer_details: {
                    customer_id: "user_" + Date.now(),
                    customer_email: email || "test@test.com",
                    customer_phone: phone || "9999999999"
                },

                order_meta: {
                    return_url: `https://precious-horse-789355.netlify.app/product-template.html?id=${product._id}&order_id=${orderId}`
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

        // 🔥 SAVE PURCHASE (ONLY CREATED, NOT PAID YET)
        await Purchase.create({
            user_email: email,
            product_id: product._id,
            order_id: orderId
        });

        console.log("✅ ORDER CREATED:", orderId);

        // 🔥 IMPORTANT CHANGE
        res.json({
            success: true,
            payment_link: response.data.payment_link
        });

    } catch (err) {
        console.error("❌ ORDER ERROR:", err.response?.data || err.message);

        res.json({
            success: false
        });
    }
});

// =========================
// VERIFY PAYMENT
// =========================
app.post("/verify-payment", async (req, res) => {

    try {

        const { order_id } = req.body;

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

        const isPaid = response.data.order_status === "PAID";

        res.json({ success: isPaid });

    } catch (err) {
        console.error("❌ VERIFY ERROR:", err.response?.data || err.message);
        res.json({ success: false });
    }
});
// =========================
// 🆕 GET USER PURCHASES
// =========================
app.get("/my-purchases/:email", async (req, res) => {
    try {
        const purchases = await Purchase.find({
            user_email: req.params.email
        });

        res.json(purchases);
    } catch (err) {
        res.json([]);
    }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});

// =========================
// UPDATE PRODUCT
// =========================
app.put("/update-product/:id", async (req, res) => {
    try {
        await Product.updateOne(
            { id: req.params.id },
            req.body
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});