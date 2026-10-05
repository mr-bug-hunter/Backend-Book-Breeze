const mongoose = require("mongoose")

const book = new mongoose.Schema({
    title:{
        type: String,
    },
    author:{
        type: String,
    },
    price: {
        type: Number,
    },
    categories:{
        type: String,
    },
    image:{
        type: String,
    },
    rating:{
        type: Number,
    },
    description:{
        type: String,
    },
    stock:{
        type: Number,
    }
})

const bookStore = mongoose.model("bookStore", book)

module.exports = bookStore