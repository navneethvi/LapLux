const Mongoose = require("mongoose")

const couponSchema = Mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    createdOn : {
        type : Date,
        required : true
    },
    expireOn : {
        type : Date,
        required : true
    },
    offerPrice : {
        type : Number,
        required : true
    },
    minimumPrice : {
        type : Number,
        required : true
    },
    isList : {
        type : Boolean,
        default : true
    },
    userId : {
        type : Array
    }
})

const Coupon = Mongoose.model("coupon", couponSchema)

module.exports = Coupon