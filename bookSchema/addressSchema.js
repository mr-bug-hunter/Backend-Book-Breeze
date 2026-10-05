const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    phone:{
        type: String,
    },
    address:{
        type: String,
    },
    city:{
        type: String,
    },
    state:{
        type: String,
    },
    pincode:{
        type: String,
    }
})

const Address = mongoose.model("Address", addressSchema)

module.exports = Address