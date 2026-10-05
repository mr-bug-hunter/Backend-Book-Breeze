const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    items:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "bookStore"
            },
            title: String,
            price: Number,
            quantity: Number,
        }
    ],
    address:{
        name: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    totalAmount: Number,
    orderDate:{
        type: Date,
        default:Date.now
    }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order