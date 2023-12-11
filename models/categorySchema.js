const Mongoose = require("mongoose")
const categorySchema =  Mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true
    },
    isListed : {
        type : Boolean,
        default : true
    }
})

const Category = Mongoose.model("Category", categorySchema)

module.exports = Category