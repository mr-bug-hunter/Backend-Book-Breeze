const mongoose = require("mongoose")

const wishlistSchema = new mongoose.Schema({

    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookStore",
        required: true ,
    }
})

const WishList = mongoose.model("WishList", wishlistSchema)

module.exports = WishList