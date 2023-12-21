const User = require("../models/userSchema")
const Product = require("../models/productSchema")


const getCartPage = async (req, res) => {
    try {
        const id = req.session.user
        console.log(id);
        const user = await User.findById({ _id: id })
        res.render("cart", { user: user })
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
        }else{
            res.json({status : "Out of stock"})
        }

        res.json({ status: true })
        


    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getCartPage,
    addToCart
}