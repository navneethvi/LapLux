const Mongoose = require("mongoose")

const connectDB = Mongoose.connect("mongodb://127.0.0.1:27017/LapLux")

connectDB
    .then(()=>console.log("Database Connected"))
    .catch((err)=>console.log(err.message))