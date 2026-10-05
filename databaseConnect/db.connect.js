const mongoose = require("mongoose")
require("dotenv").config()

const mongoUri = process.env.MONGODB

const initialize = async ()=>{
    await mongoose
    .connect(mongoUri)
    .then(()=>{
        console.log("Database Connected to Successfully.")
    }).catch((error)=>console.log({error: "Error in connecting to Database"}))
}

module.exports = {initialize}