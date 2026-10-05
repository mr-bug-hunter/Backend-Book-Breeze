const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name : {
       type: String,
    },
    image:{
        type: String,
    },
})

const categoryBook = mongoose.model("categoryBook", categorySchema)

module.exports = categoryBook