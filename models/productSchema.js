const Mongoose = require("mongoose")

const productSchema = Mongoose.Schema({
    id : {
        type : String,
        required : true,
    },
    productName : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    brand : {
        type : String,
        required : true,
    },
    category : {
        type : String,
        required : true,
    },
    regularPrice : {
        type : Number,
        required : true,
    },
    salePrice : {
        type : Number,
        required : true,
    },
    createdOn : {
        type : String,
        required : true,
    },
    quantity : {
        type : Number,
        required : true,
    },
    isBlocked : {
        type : Boolean,
        default : false,
    },
    productImage : {
        type : Array,
        required : true,
    },
    size : {
        type : String,
        required : true
    },
    color : {
        type : String,
        required : true,
    },
    processor : {
        type : String,
        required : true
    },
    productOffer : {
        type : Number,
        default : 0
    }
})

const Product = Mongoose.model("Product", productSchema)

module.exports = Product