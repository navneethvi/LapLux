const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Mongoose = require("mongoose")
const { use } = require("passport")


const getCartPage = async (req, res) => {
    try {
        const id = req.session.user
        console.log(id);
        console.log("cart is workding");
        const user = await User.findById({ _id: id })
        const ObjectId = Mongoose.Types.ObjectId
        const productIds = await user.cart.map(cartItem => cartItem.productId)
        const objectIdArray = productIds.map(id => new ObjectId(id))
        const findProduct = await Product.find({ _id: { $in: objectIdArray } }).lean()
    
        res.render("cart", { user: user, product : findProduct})
    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res) => {
    try {
        const id = req.query.id

        const userId = req.session.user

        const product = await Product.findById({ _id: id }).lean()

        if (product.quantity > 0) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    cart: {
                        productId: product._id,
                        quantity: product.quantity,
                    }
                }
            })
        } else {
            res.json({ status: "Out of stock" })
        }

        res.json({ status: true })



    } catch (error) {
        console.log(error.message);
    }
}


const deleteProduct = async (req, res)=>{
    try {
        const user = req.session.user
    
        if(!user){
            res.json("User not found")
            console.log("User not found");
            return
        }
        const id = req.query.id
        console.log(id);
        const userData = await User.findOne({_id : user})
  
        if(!userData){
            res.json("User not found")
            console.log("User not found 2");
            return
        }

        const existingCartItemIndex = userData.cart.findIndex(item => item.productId === id)
        console.log(existingCartItemIndex);
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getCartPage,
    addToCart,
    deleteProduct
}