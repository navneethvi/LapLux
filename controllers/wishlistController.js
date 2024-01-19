const User = require("../models/userSchema")
const Product = require("../models/productSchema");


const getWishlistPage = async (req, res)=>{
    try {
        const userId = req.session.userId
        const findUser = await User.findOne({_id : userId})
        res.render("wishlist")
    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async(req, res)=>{
    try {
        console.log("imhereee");
        console.log(req.body);

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getWishlistPage,
    addToWishlist
}