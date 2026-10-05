const dns = require("dns")
dns.setServers(["1.1.1.1", "1.0.0.1"])

const mongoose = require("mongoose")
require("dotenv").config()

const mongoUri = process.env.MONGODB

const initialize = async ()=>{
    await mongoose
    .connect(mongoUri)
    .then(()=>{
        console.log("Database Connected to Successfully.")
    }).catch((error)=>
        console.log({error: "Error in connecting to Database", error}))
}

module.exports = {initialize}