const Mongoose = require("mongoose")

const connectDB = Mongoose.connect('mongodb://navaneeth-v:navaneethUNNI@ac-9rix4yo-shard-00-00.g0ss5bb.mongodb.net:27017,ac-9rix4yo-shard-00-01.g0ss5bb.mongodb.net:27017,ac-9rix4yo-shard-00-02.g0ss5bb.mongodb.net:27017/LapLux?ssl=true&replicaSet=atlas-10l1hg-shard-0&authSource=admin&retryWrites=true&w=majority')

connectDB
    .then(()=>console.log("Database Connected"))
    .catch((err)=>console.log(err.message))
    







    // "mongodb+srv://navaneeth-v:navaneethUNNI@cluster-1.g0ss5bb.mongodb.net/LapLux?retryWrites=true&w=majority"