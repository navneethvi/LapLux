const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const mongodb = require("mongodb")


const getCartPage = async (req, res) => {
    try {
        const id = req.session.user
        // console.log(id);
        // console.log("cart is workding");
        const user = await User.findOne({ _id : id })
        const productIds = user.cart.map(item=>item.productId)
        // console.log(productIds);
        const products = await Product.find({ _id : {$in : productIds}})
        // console.log(user.cart[0].quantity); 
        


        let quantity = 0
        for(const i of user.cart){
            quantity += i.quantity
        }
        
            res.render("cart", {
                user,
                quantity,
                product: products,
                cart : user.cart
            })
        

       
    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id);
        const userId = req.session.user
        const findUser = await User.findById(userId)
        // console.log(findUser);
        const product = await Product.findById({ _id: id }).lean()
        if (!product) {
            return res.json({ status: "Product not found" });
        }
        if (product.quantity > 0) {
            const cartIndex = findUser.cart.findIndex(item => item.productId == id)
            console.log(cartIndex, "cartIndex");
            if (cartIndex == -1) {
                console.log("this");
                let quantity = parseInt(req.body.quantity)
                await User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        cart: {
                            productId: id,
                            quantity: quantity
                        }
                    }
                })
                    .then((data) =>
                        res.json({ status: true }))
            } else {
                console.log("hi");
                const productInCart = findUser.cart[cartIndex]
                console.log(productInCart);
                const newQuantity = parseInt(productInCart.quantity) + parseInt(req.body.quantity)
                console.log(productInCart, "product", newQuantity);

                await User.updateOne(
                    { _id: userId, "cart.productId": id },
                    { $set: { "cart.$.quantity": newQuantity } }
                );
                res.json({ status: true })
            }
        } else {
            res.json({ status: "Out of stock" })
        }


    } catch (error) {
        console.log(error.message);
    }
}


const changeQuantity = async (req, res) => {
    try {
       
    } catch (error) {
        console.log(error.message);
    }
}


const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id, "id");
        const userId = req.session.user
        const user = await User.findById(userId)
        const cartIndex = user.cart.findIndex(item => item.productId == id)
        user.cart.splice(cartIndex, 1)
        await user.save()
        console.log("item deleted from cart");
        res.redirect("/cart")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getCartPage,
    addToCart,
    changeQuantity,
    deleteProduct
}