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
        const userId = req.session.id
        console.log(userId);
        const product = await Product.findById({_id : id})
        if(product.quantity > 0){
            const newCart = await User.findByIdAndUpdate(userId,{
                $addToSet : {
                    cart : {
                        productId : product._id,
                        quantity : product.quantity,
                        
                    }
                }
            })
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCartPage,
    addToCart
}