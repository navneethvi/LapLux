const User = require("../models/userSchema")
const Product = require("../models/productSchema")


const getCartPage = async (req, res)=>{
    try {
        const id = req.session.user
        console.log(id);
        const user = await User.findById({_id : id})
        res.render("cart", {user : user})
    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res)=>{
    try {
        const id = req.query.id
        const product = await Product.findById({_id : id})
        if(product.quantity > 1){
            
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCartPage
}