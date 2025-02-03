const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors({ origin: true })); // Allow cross-origin requests
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: "YOUR_RAZORPAY_KEY_ID",
    key_secret: "YOUR_RAZORPAY_KEY_SECRET",
});

// API to create a Razorpay order
app.post("/create-order", async (req, res) => {
    const { amount, currency } = req.body;

    const options = {
        amount: amount * 100, // Amount in paise (INR)
        currency: currency || "INR",
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Deploy Firebase function
exports.api = functions.https.onRequest(app);
