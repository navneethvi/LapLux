const Mongoose = require("mongoose")

const orderSchema = Mongoose.Schema({
    product : {
        type : Array,
        required : true
    },
    totalPrice : {
        type : Number,
        required : true
    },
    address : {
        type : Array,
        required : true
    },
    payment : {
        type : String,
        required : true
    },
    userId : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    createdOn : {
        type : Date,
        required : true,
        default : Date.now
    },
    date : {
        type : String,
        required : true
    }
})

const Order = Mongoose.model("Order", orderSchema)

module.exports = Order