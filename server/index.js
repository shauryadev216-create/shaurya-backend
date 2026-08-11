const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

const FRONTEND_URL =
    "https://precious-horse-789355.netlify.app";

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "20mb"
    })
);

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME;

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

const ADMIN_SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET;


// =====================================================
// CREATE SIGNED ADMIN TOKEN
// =====================================================

function createAdminToken() {

    const timestamp =
        Date.now().toString();

    const signature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(timestamp)
            .digest("hex");

    return timestamp + "." + signature;
}


// =====================================================
// VERIFY ADMIN TOKEN
// =====================================================

function verifyAdminToken(token) {

    if (!token) {
        return false;
    }

    const parts =
        token.split(".");

    if (parts.length !== 2) {
        return false;
    }

    const timestamp =
        parts[0];

    const signature =
        parts[1];

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(timestamp)
            .digest("hex");

    if (signature.length !== expectedSignature.length) {
        return false;
    }

    if (
        !crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        )
    ) {
        return false;
    }

    const age =
        Date.now() -
        Number(timestamp);

    // Session expires after 24 hours
    if (
        age < 0 ||
        age > 24 * 60 * 60 * 1000
    ) {
        return false;
    }

    return true;
}


// =====================================================
// REQUIRE ADMIN
// =====================================================

function requireAdmin(req, res, next) {

    const cookies =
        req.headers.cookie || "";

    const match =
        cookies.match(
            /admin_session=([^;]+)/
        );

    const token =
        match
            ? decodeURIComponent(match[1])
            : null;

    if (!verifyAdminToken(token)) {

        return res.status(401).json({

            success: false,

            message:
                "Unauthorized"
        });
    }

    next();
}


// =====================================================
// MONGODB CONNECT
// =====================================================

mongoose
    .connect(
        process.env.MONGO_URI,
        {
            serverSelectionTimeoutMS: 10000
        }
    )
    .then(
        () => {
            console.log(
                "✅ MongoDB Connected"
            );
        }
    )
    .catch(
        err => {

            console.error(
                "❌ MongoDB Error:",
                err
            );
        }
    );


// =====================================================
// PRODUCT SCHEMA
// =====================================================

const productSchema =
    new mongoose.Schema(
        {
            id: {
                type: String
            },

            title: {
                type: String
            },

            price: {
                type: Number
            },

            originalPrice: {
                type: Number,
                default: 0
            },

            discount: {
                type: Number,
                default: 0
            },

            cover: {
                type: String
            },

            preview: {
                type: Array,
                default: []
            },

            description: {
                type: String
            },

            type: {
                type: String
            },

            original: {
                type: String
            },

            zip: {
                type: String
            },

            category: {
                type: Array,
                default: []
            }
        },
        {
            timestamps: true
        }
    );


const Product =
    mongoose.model(
        "Product",
        productSchema
    );


// =====================================================
// PURCHASE SCHEMA
// =====================================================

const purchaseSchema =
    new mongoose.Schema(
        {
            user_email: {
                type: String
            },

            product_id: {
                type: String
            },

            order_id: {
                type: String
            },

            created_at: {
                type: Date,
                default: Date.now
            }
        }
    );


const Purchase =
    mongoose.model(
        "Purchase",
        purchaseSchema
    );


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message:
                "MINDLENS backend is running 🚀"
        });
    }
);

// =====================================================
// ADMIN LOGIN
// =====================================================

app.post(
    "/admin-login",
    (req, res) => {

        const {
            username,
            password
        } = req.body;

        if (
            !username ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Username and password are required."
            });
        }

        if (
            username !== ADMIN_USERNAME ||
            password !== ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password."
            });
        }

        const token =
            createAdminToken();

        res.setHeader(
            "Set-Cookie",
            [
                `admin_session=${encodeURIComponent(token)}`,
                "HttpOnly",
                "Secure",
                "SameSite=None",
                "Path=/",
                "Max-Age=86400"
            ].join("; ")
        );

        res.json({
            success: true,
            message:
                "Admin login successful."
        });
    }
);


// =====================================================
// ADMIN LOGOUT
// =====================================================

app.post(
    "/admin-logout",
    (req, res) => {

        res.setHeader(
            "Set-Cookie",
            [
                "admin_session=",
                "HttpOnly",
                "Secure",
                "SameSite=None",
                "Path=/",
                "Max-Age=0"
            ].join("; ")
        );

        res.json({
            success: true
        });
    }
);


// =====================================================
// CHECK ADMIN SESSION
// =====================================================

app.get(
    "/admin-check",
    requireAdmin,
    (req, res) => {

        res.json({
            success: true,
            authenticated: true
        });
    }
);



    


// =====================================================
// ADD PRODUCT
// =====================================================

app.post(
    "/add-product",
    requireAdmin,
    async (req, res) => {

        try {

            const product =
                new Product(
                    req.body
                );


            await product.save();


            console.log(
                "✅ PRODUCT ADDED:",
                product._id
            );


            res.json({
                success: true,
                product: product
            });

        }

        catch (err) {

            console.error(
                "❌ ADD PRODUCT ERROR:",
                err
            );


            res.status(500).json({

                success: false,

                error:
                    err.message
            });
        }
    }
);


// =====================================================
// GET PRODUCTS
// =====================================================

app.get(
    "/products",
    async (req, res) => {

        try {

            const products =
                await Product
                    .find()
                    .sort({
                        createdAt: -1
                    });


            res.json(
                products
            );

        }

        catch (err) {

            console.error(
                "❌ GET PRODUCTS ERROR:",
                err
            );


            res.status(500).json(
                []
            );
        }
    }
);


// =====================================================
// DELETE PRODUCT
// =====================================================

app.delete(
    "/delete-product/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const id =
                req.params.id;


            console.log(
                "🗑️ DELETE REQUEST:",
                id
            );


            let deleted;


            // =================================================
            // TRY MONGODB _id
            // =================================================

            if (
                mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                deleted =
                    await Product.findByIdAndDelete(
                        id
                    );
            }


            // =================================================
            // IF NOT FOUND, TRY CUSTOM id
            // =================================================

            if (!deleted) {

                deleted =
                    await Product.findOneAndDelete(
                        {
                            id: id
                        }
                    );
            }


            // =================================================
            // NOT FOUND
            // =================================================

            if (!deleted) {

                console.log(
                    "❌ PRODUCT NOT FOUND:",
                    id
                );


                return res.status(404).json({

                    success: false,

                    error:
                        "Product not found."
                });
            }


            console.log(
                "✅ PRODUCT DELETED:",
                deleted._id
            );


            res.json({

                success: true,

                message:
                    "Product deleted successfully."
            });

        }

        catch (err) {

            console.error(
                "❌ DELETE ERROR:",
                err
            );


            res.status(500).json({

                success: false,

                error:
                    err.message
            });
        }
    }
);


// =====================================================
// UPDATE PRODUCT
// =====================================================

app.put(
    "/update-product/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const id =
                req.params.id;


            console.log(
                "✏️ UPDATE REQUEST:",
                id
            );


            let updated = null;


            // =================================================
            // TRY MONGODB _id
            // =================================================

            if (
                mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                updated =
                    await Product.findByIdAndUpdate(
                        id,
                        req.body,
                        {
                            new: true,
                            runValidators: true
                        }
                    );
            }


            // =================================================
            // TRY CUSTOM id
            // =================================================

            if (!updated) {

                updated =
                    await Product.findOneAndUpdate(
                        {
                            id: id
                        },

                        req.body,

                        {
                            new: true,
                            runValidators: true
                        }
                    );
            }


            // =================================================
            // NOT FOUND
            // =================================================

            if (!updated) {

                console.log(
                    "❌ PRODUCT NOT FOUND:",
                    id
                );


                return res.status(404).json({

                    success: false,

                    error:
                        "Product not found."
                });
            }


            console.log(
                "✅ PRODUCT UPDATED:",
                updated._id
            );


            res.json({

                success: true,

                message:
                    "Product updated successfully.",

                product:
                    updated
            });

        }

        catch (err) {

            console.error(
                "❌ UPDATE PRODUCT ERROR:",
                err
            );


            res.status(500).json({

                success: false,

                error:
                    err.message
            });
        }
    }
);


// =====================================================
// CREATE CASHFREE ORDER
// =====================================================

app.post(
    "/create-order",
    async (req, res) => {

        try {

            // =================================================
            // ACCEPT BOTH NAMES
            // =================================================

            const productId =
                req.body.productId ||
                req.body.id;


            const amount =
                Number(
                    req.body.amount
                );


            const phone =
                req.body.phone;


            const email =
                req.body.email;


            // =================================================
            // VALIDATION
            // =================================================

            if (!productId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Missing productId"
                });
            }


            if (
                !amount ||
                amount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid amount"
                });
            }


            if (!phone) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Missing phone"
                });
            }


            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Missing email"
                });
            }


            // =================================================
            // VERIFY PRODUCT EXISTS
            // =================================================

            let product = null;


            if (
                mongoose.Types.ObjectId.isValid(
                    productId
                )
            ) {

                product =
                    await Product.findById(
                        productId
                    );
            }


            if (!product) {

                product =
                    await Product.findOne({
                        id: productId
                    });
            }


            if (!product) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"
                });
            }


            // =================================================
            // ALWAYS USE DATABASE PRICE
            // =================================================

            const finalAmount =
                Number(
                    product.price
                );


            if (
                !finalAmount ||
                finalAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product has an invalid price"
                });
            }


            // =================================================
            // CREATE ORDER ID
            // =================================================

            const orderId =
                "order_" +
                Date.now();


            // =================================================
            // CASHFREE REQUEST
            // =================================================

            const response =
                await axios.post(

                    "https://api.cashfree.com/pg/orders",

                    {

                        order_amount:
                            finalAmount,

                        order_currency:
                            "INR",

                        order_id:
                            orderId,


                        customer_details: {

                            customer_id:
                                "user_" +
                                Date.now(),

                            customer_email:
                                email,

                            customer_phone:
                                phone
                        },


                        order_meta: {

                            return_url:
                                `https://precious-horse-789355.netlify.app/product-template.html?id=${encodeURIComponent(
                                    product._id
                                )}&order_id=${encodeURIComponent(
                                    orderId
                                )}`
                        },


                        order_note:
                            product.title || "Digital Product"

                    },


                    {

                        headers: {

                            "x-client-id":
                                process.env.APP_ID,

                            "x-client-secret":
                                process.env.SECRET_KEY,

                            "x-api-version":
                                "2022-09-01",

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            console.log(
                "✅ CASHFREE ORDER CREATED:",
                response.data
            );


            // =================================================
            // SAVE PURCHASE
            // =================================================

            await Purchase.create({

                user_email:
                    email,

                product_id:
                    String(
                        product._id
                    ),

                order_id:
                    orderId
            });


            // =================================================
            // RESPONSE
            // =================================================

            res.json({

                success: true,

                payment_session_id:
                    response.data
                        .payment_session_id,

                order_id:
                    orderId
            });

        }

        catch (err) {

            console.error(
                "❌ CASHFREE ORDER ERROR:"
            );


            console.error(
                err.response?.data ||
                err.message
            );


            res.status(500).json({

                success: false,

                message:
                    err.response?.data
                        ?.message ||
                    err.response?.data
                        ?.error_description ||
                    err.message,

                error:
                    err.response?.data ||
                    err.message
            });
        }
    }
);


// =====================================================
// VERIFY PAYMENT
// =====================================================

app.post(
    "/verify-payment",
    async (req, res) => {

        const {
            order_id
        } = req.body;


        if (!order_id) {

            return res.json({

                success: false,

                message:
                    "Missing order_id"
            });
        }


        try {

            const response =
                await axios.get(

                    `https://api.cashfree.com/pg/orders/${encodeURIComponent(
                        order_id
                    )}`,

                    {

                        headers: {

                            "x-client-id":
                                process.env.APP_ID,

                            "x-client-secret":
                                process.env.SECRET_KEY,

                            "x-api-version":
                                "2022-09-01"
                        }
                    }
                );


            console.log(
                "💳 PAYMENT STATUS:",
                response.data
                    .order_status
            );


            res.json({

                success:
                    response.data
                        .order_status ===
                    "PAID"
            });

        }

        catch (err) {

            console.error(
                "❌ VERIFY ERROR:",
                err.response?.data ||
                err.message
            );


            res.json({

                success: false
            });
        }
    }
);


// =====================================================
// USER PURCHASES
// =====================================================

app.get(
    "/my-purchases/:email",
    async (req, res) => {

        try {

            const purchases =
                await Purchase.find({

                    user_email:
                        req.params.email
                });


            res.json(
                purchases
            );

        }

        catch (err) {

            console.error(
                "❌ PURCHASES ERROR:",
                err
            );


            res.json(
                []
            );
        }
    }
);


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT ||
    3000;


app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "🚀 Server running on port " +
            PORT
        );
    }
);