const Mongoose = require("mongoose")

const userSchema = Mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    phone : {
        type : Number,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    createdOn : {
        type : String
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    isAdmin : {
        type : String,
        default : "0"
    }
})



const User = Mongoose.model("User", userSchema)

module.exports = User