const Mongoose = require("mongoose")

const couponSchema = Mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    code : {
        type : Array,
        required : true
    },
    createdOn : {
        type : String,
        required : true
    },
    expireOn : {
        type : String,
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
    status : {
        type : String,
        required : true
    },
    userId : {
        type : Array
    }
})

const Coupon = Mongoose.model("coupon", couponSchema)

module.exports = Coupon