const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const userSchema = Mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdOn: {
        type: String
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: String,
        default: "0"
    },
    cart: {
        type: Array
    },
    wishlist: {
        type: Array
    },
    wallet: {
        type: Number,
        default: 0
    },
    history: {
        type: Array
    },
    referalCode: {
        type: String,
        required: true,
    },
    redeemed: {
        type: Boolean,
        default: false,
    },
    redeemedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }
    ],
});


const User = Mongoose.model("User", userSchema);

module.exports = User;
